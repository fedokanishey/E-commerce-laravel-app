<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DesignSystemPageTest extends TestCase
{
    public function test_design_system_preview_renders(): void
    {
        $this->get(route('design-system'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('design-system'));
    }
}
