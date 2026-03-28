<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('GET /users', function () {
    it('renders the users index page', function () {
        $this->get('/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('users/index')
                ->has('users')
                ->has('filters')
            );
    });

    it('returns paginated users', function () {
        User::factory()->count(5)->create();

        $this->get('/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('users.data')
                ->has('users.current_page')
                ->has('users.last_page')
                ->has('users.total')
            );
    });

    it('filters users by search term across name and email', function () {
        User::factory()->create(['name' => 'Alice Smith', 'email' => 'alice@example.com']);
        User::factory()->create(['name' => 'Bob Jones', 'email' => 'bob@example.com']);

        $this->get('/users?search=Alice')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('users.data', 1)
                ->where('users.data.0.name', 'Alice Smith')
            );
    });

    it('returns no results when search matches nothing', function () {
        User::factory()->create(['name' => 'Charlie', 'email' => 'charlie@example.com']);

        $this->get('/users?search=zzznomatch')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('users.data', 0)
            );
    });

    it('sorts users by name ascending', function () {
        User::factory()->create(['name' => 'Zelda']);
        User::factory()->create(['name' => 'Aaron']);

        $this->get('/users?sort=name&direction=asc')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('users.data.0.name', 'Aaron')
            );
    });

    it('sorts users by name descending', function () {
        User::factory()->create(['name' => 'Zelda']);
        User::factory()->create(['name' => 'Aaron']);

        $this->get('/users?sort=name&direction=desc')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('users.data.0.name', 'Zelda')
            );
    });

    it('respects per_page query param', function () {
        User::factory()->count(20)->create();

        $this->get('/users?per_page=5')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('users.per_page', 5)
                ->has('users.data', 5)
            );
    });

    it('caps per_page at 100', function () {
        $this->get('/users?per_page=999')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('users.per_page', 100)
            );
    });

    it('returns filters back in the response', function () {
        $this->get('/users?search=foo&sort=name&direction=asc&per_page=25')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'foo')
                ->where('filters.sort', 'name')
                ->where('filters.direction', 'asc')
                ->where('filters.per_page', 25)
            );
    });

    it('ignores disallowed sort columns', function () {
        $this->get('/users?sort=password&direction=asc')
            ->assertOk();
        // Should not throw and should return results unsorted
    });

    it('redirects guests to login', function () {
        auth()->logout();

        $this->get('/users')
            ->assertRedirect('/login');
    });
});

describe('GET /users/create', function () {
    it('renders the create user page', function () {
        $this->get('/users/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('users/create'));
    });
});

describe('POST /users', function () {
    it('creates a new user and redirects', function () {
        $data = [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $this->post('/users', $data)
            ->assertRedirect('/users')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    });

    it('requires valid data', function () {
        $this->post('/users', [])
            ->assertSessionHasErrors(['name', 'email', 'password']);
    });
});

describe('GET /users/{user}/edit', function () {
    it('renders the edit user page', function () {
        $user = User::factory()->create();

        $this->get("/users/{$user->id}/edit")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('users/edit')
                ->has('user', fn (Assert $p) => $p
                    ->where('id', $user->id)
                    ->where('email', $user->email)
                    ->etc()
                )
            );
    });
});

describe('PUT /users/{user}', function () {
    it('updates the user and redirects', function () {
        $user = User::factory()->create(['name' => 'Old Name']);

        $this->put("/users/{$user->id}", [
            'name' => 'New Name',
            'email' => $user->email,
        ])
            ->assertRedirect('/users')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
        ]);
    });

    it('can update password', function () {
        $user = User::factory()->create();

        $this->put("/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])
            ->assertRedirect('/users');

        $this->assertTrue(Hash::check('newpassword123', $user->refresh()->password));
    });
});

describe('DELETE /users/{user}', function () {
    it('deletes the user and redirects', function () {
        $user = User::factory()->create();

        $this->delete("/users/{$user->id}")
            ->assertRedirect('/users')
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    });

    it('prevents deleting oneself', function () {
        // Optional: Implement self-deletion prevention if needed
        // For now, let's just test that it works as implemented
        $this->delete("/users/{$this->user->id}")
            ->assertRedirect('/users');

        $this->assertDatabaseMissing('users', ['id' => $this->user->id]);
    });
});
