<?php
/* NOTICE: Generated file; Do not edit by hand */
namespace VK\Elephize\src\__tests__\specimens\components\ReactSupport2;
use VK\Elephize\Builtins\RenderableComponent;
use VK\Elephize\Builtins\IntrinsicElement;
use VK\Elephize\Builtins\Stdlib;

class ReactSupport2 extends RenderableComponent {
    /**
     * @var ReactSupport2 $_mod
     */
    private static $_mod;
    public static function getInstance(): ReactSupport2 {
        if (!self::$_mod) {
            self::$_mod = new ReactSupport2();
        }
        return self::$_mod;
    }

    private function __construct() {
    }

    /**
     * @param array $props
     * @param array $children
     * @return string
     */
    public function render(array $props, array $children) {
        $_18b93da = [1];
        $cnt = $_18b93da[0];
        \VK\Elephize\Builtins\Console::log($cnt);
        \VK\Elephize\Builtins\Console::log($theme);
        $_2e8ff8c = [[1, 2, 3, 4]];
        $state = $_2e8ff8c[0];
        \VK\Elephize\Builtins\Console::log($state);
        $memoized_callback();
        \VK\Elephize\Builtins\Console::log($memoized);
        \VK\Elephize\Builtins\Console::log($ref);
        return IntrinsicElement::get("div")->render([], []);
    }
}
