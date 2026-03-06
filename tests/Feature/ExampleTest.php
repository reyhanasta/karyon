<?php

test('returns a redirect to login by default', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
