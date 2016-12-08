<?php
namespace Roots\Sage\Template;

use Jenssegers\Blade\Blade;
use Illuminate\View\Engines\CompilerEngine;

class BladeProvider extends Blade
{
    /** @var Blade */
    public $blade;
    /** @var string */
    protected $cachePath;
    /**
     * @param string $view
     * @param array $data
     * @param array $mergeData
     * @return \Illuminate\View\View
     */
    public function make($view, $data = [], $mergeData = [])
    {
        return $this->container['view']->make($this->normalizeViewPath($view), $data, $mergeData);
    }
    /**
     * @param string $view
     * @param array $data
     * @param array $mergeData
     * @return string
     */
    public function render($view, $data = [], $mergeData = [])
    {
        return $this->make($view, $data, $mergeData)->render();
    }
    /**
     * @param string $file
     * @param array $data
     * @param array $mergeData
     * @return string
     */
    public function compiledPath($file, $data = [], $mergeData = [])
    {
        $rendered = $this->make($file, $data, $mergeData);
        $engine = $rendered->getEngine();
        if (!($engine instanceof CompilerEngine)) {
            // Using PhpEngine, so just return the file
            return $file;
        }
        $compiler = $engine->getCompiler();
        $compiledPath = $compiler->getCompiledPath($rendered->getPath());
        if ($compiler->isExpired($compiledPath)) {
            $compiler->compile($file);
        }
        return $compiledPath;
    }
    /**
     * @param string $file
     * @return string
     */
    public function normalizeViewPath($file)
    {
        // Convert `\` to `/`
        $view = str_replace('\\', '/', $file);
        // Remove unnecessary parts of the path
        $view = str_replace(array_merge((array) $this->viewPaths, ['.blade.php', '.php']), '', $view);
        // Remove leading slashes
        $view = ltrim($view, '/');
        // Convert `/` to `.`
        return str_replace('/', '.', $view);
    }
}
