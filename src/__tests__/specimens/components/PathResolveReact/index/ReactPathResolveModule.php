<?php
/* NOTICE: autogenerated file; Do not edit by hand */
namespace specimens\components\PathResolveReact\index;
use VK\Elephize\Builtins\RenderableComponent;
use VK\Elephize\Builtins\Stdlib;

class ReactPathResolveModule extends RenderableComponent {
    /**
     * @var ReactPathResolveModule $_mod
     */
    private static $_mod;
    public static function getInstance(): ReactPathResolveModule {
        if (!self::$_mod) {
            self::$_mod = new ReactPathResolveModule();
        }
        return self::$_mod;
    }

    private function __construct() {
    }

    /**
     * @param mixed[] $props
     * @param mixed[] $children
     * @return ?string
     */
    public function render(array $props, array $children) {
        return \VK\Elephize\Builtins\IntrinsicElement::get("div")->render([], ["foo"]);
    }
}
