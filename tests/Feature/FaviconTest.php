<?php

test('the shared shell uses the CleanLab logo as the favicon', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
    $response->assertSee('href="/assets/CleanLab-Logo.svg"', false);
});
