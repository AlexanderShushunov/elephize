<?php
/* NOTICE: Generated file; Do not edit by hand */
namespace VK\Elephize;
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class ConstructorTypeCastModule extends CJSModule {
    /**
     * @var ConstructorTypeCastModule $_mod
     */
    private static $_mod;
    public static function getInstance(): ConstructorTypeCastModule {
        if (!self::$_mod) {
            self::$_mod = new ConstructorTypeCastModule();
        }
        return self::$_mod;
    }

    /**
     * @var string $tca
     */
    public $tca;
    /**
     * @var float $tcb
     */
    public $tcb;
    /**
     * @var string $tcc
     */
    public $tcc;
    /**
     * @var boolean $tcd
     */
    public $tcd;

    private function __construct() {
        $this->tca = "1";
        $this->tcb = +$this->tca;
        $this->tcc = (string) $this->tcb;
        $this->tcd = (bool) $this->tcc;
        \VK\Elephize\Builtins\Console::log($this->tcd);
    }
}
