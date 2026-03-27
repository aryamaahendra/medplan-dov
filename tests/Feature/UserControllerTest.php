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
