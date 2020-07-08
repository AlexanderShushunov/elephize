<?php
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class SpliceModule extends CJSModule {
    /**
     * @var SpliceModule $_mod
     */
    private static $_mod;
    public static function getInstance(): SpliceModule {
        if (!self::$_mod) {
            self::$_mod = new SpliceModule();
        }
        return self::$_mod;
    }

    public $a_spl;
    public $b_spl;
    public $c_spl;
    public $d_spl;
    public $e_spl;

    private function __construct() {
        $this->a_spl = [1, 2, 3];
        $this->b_spl = array_splice($this->a_spl, 1);
        $this->c_spl = array_splice($this->a_spl, 1, 1);
        $this->d_spl = array_splice($this->a_spl, 1, 0, [4, 5]);
        $this->e_spl = array_splice($this->a_spl, 1, 2, [4, 5, 6, 7]);
        \VK\Elephize\Builtins\Console::log($this->b_spl, $this->c_spl, $this->d_spl, $this->e_spl);
    }
}
