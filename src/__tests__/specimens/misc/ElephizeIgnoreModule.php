<?php
/* NOTICE: Generated file; Do not edit by hand */
namespace VK\Elephize\src\__tests__\specimens\misc;
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class ElephizeIgnoreModule extends CJSModule {
    /**
     * @var ElephizeIgnoreModule $_mod
     */
    private static $_mod;
    public static function getInstance(): ElephizeIgnoreModule {
        if (!self::$_mod) {
            self::$_mod = new ElephizeIgnoreModule();
        }
        return self::$_mod;
    }

    /**
     * @var string $eit1
     */
    public $eit1;

    private function __construct() {
        $this->eit1 = "123";
    }
}
