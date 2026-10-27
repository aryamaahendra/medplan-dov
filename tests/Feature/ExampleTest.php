<?php

test('unauthenticated root request redirects to login', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect('/login');
});
