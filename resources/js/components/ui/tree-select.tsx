"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronRight, Dot, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TreeItem {
  id: number;
  name: string;
  parent_id: number | null;
  children?: TreeItem[];
}

interface TreeSelectProps {
  items: { id: number; name: string; parent_id: number | null }[];
  value?: string | number;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TreeSelect({
  items,
  value,
  onValueChange,
  placeholder = "Select item...",
  className,
  disabled,
}: TreeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());

  // Build tree from flat items
  const treeData = React.useMemo(() => {
    const itemMap = new Map<number, TreeItem>();
    const roots: TreeItem[] = [];

    items.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      const node = itemMap.get(item.id)!;
      if (item.parent_id && itemMap.has(item.parent_id)) {
        itemMap.get(item.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [items]);

  // Handle search and filtering
  const filteredTree = React.useMemo(() => {
    if (!searchQuery) return treeData;

    const filterNode = (nodes: TreeItem[]): TreeItem[] => {
      return nodes
        .map((node) => {
          const childrenMatch = node.children ? filterNode(node.children) : [];
          const selfMatches = node.name.toLowerCase().includes(searchQuery.toLowerCase());

          if (selfMatches || childrenMatch.length > 0) {
            return { ...node, children: childrenMatch } as TreeItem;
          }
          return null;
        })
        .filter((node): node is TreeItem => node !== null);
    };

    return filterNode(treeData);
  }, [treeData, searchQuery]);

  // Auto-expand parents when searching
  React.useEffect(() => {
    if (searchQuery) {
      const getAllParentIds = (nodes: TreeItem[], parents: number[] = []): number[] => {
        let ids: number[] = [];
        nodes.forEach(node => {
          const hasMatchingDescendant = (n: TreeItem): boolean => {
             return n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (n.children?.some(hasMatchingDescendant) ?? false);
          };
          
          if (node.children && node.children.length > 0 && node.children.some(hasMatchingDescendant)) {
            ids.push(node.id);
            ids = [...ids, ...getAllParentIds(node.children)];
          }
        });
        return ids;
      };
      
      const idsToExpand = getAllParentIds(treeData);
      setExpandedIds(new Set(idsToExpand));
    }
  }, [searchQuery, treeData]);

  const toggleExpand = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const selectedItem = React.useMemo(() => 
    items.find(i => i.id.toString() === value?.toString()), 
    [items, value]
  );

  const renderTreeNodes = (nodes: TreeItem[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedIds.has(node.id);
      const isSelected = value?.toString() === node.id.toString();
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node.id} className="w-full">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm text-sm transition-colors",
              isSelected && "bg-accent text-accent-foreground font-medium",
              level > 0 && ""
            )}
            onClick={() => {
              onValueChange(node.id.toString());
              setOpen(false);
              setSearchQuery("");
            }}
          >
            <div 
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-muted/50"
              onClick={(e) => hasChildren && toggleExpand(e, node.id)}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronRight className="size-3" />
                )
              ) : <Dot className="size-3"/>}
            </div>
            <span className="flex-1 whitespace-normal">{node.name}</span>
            {isSelected && <Check className="size-3 opacity-70" />}
          </div>
          {hasChildren && isExpanded && (
            <div className="w-full pl-4 border-muted/50">
              {renderTreeNodes(node.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full h-9 justify-between font-normal", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedItem ? selectedItem.name : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 flex flex-col gap-0 max-h-[85vh]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{placeholder}</DialogTitle>
        </DialogHeader>
        <div className="p-3 border-b">
          <InputGroup>
            <InputGroupAddon>
              <Search className="h-4 w-4 opacity-50" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Cari unit kerja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <InputGroupAddon align="inline-end" className="text-xs">
                {(() => {
                  const countMatches = (nodes: TreeItem[]): number => {
                    return nodes.reduce((acc, node) => {
                      const matches = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
                      return acc + matches + (node.children ? countMatches(node.children) : 0);
                    }, 0);
                  };
                  return countMatches(filteredTree);
                })()} hasil
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
        <ScrollArea className="flex-1 no-scrollbar overflow-y-auto p-1">
          <div className="p-1">
            {filteredTree.length > 0 ? (
              renderTreeNodes(filteredTree)
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada hasil ditemukan.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
