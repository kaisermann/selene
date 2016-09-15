# PHASE

A gulp-automated front-end workflow based on the (awesome) [Sage starter theme](https://github.com/roots/sage).
<br>
<br>
With Phase you can:
* Write CSS with Stylus
	* Build your website's grid with the RolleiFLEX declarative (or not) grid framework.
	* Use simplified media queries with rupture
* Write JS with Babel (ES2015)
* See live changes (CSS/JS/HTML) on your project with [browserSync](https://www.browsersync.io/)
* Have your [bower](https://bower.io/) packages automatically included in your assets
	* Check the **config.json** on the **assets/** directory

## Installation

1. git clone git@github.com:kaisermann/phase.git
2. npm install (it will also execute bower install)
3. Run at least '**gulp build**' before running' **gulp watch**'

## Documentation

### Phase

Please refer to the following files:

* assets/config.json
* assets/styles/config/*.styl

#### Gulp

##### Tasks

* '**gulp**' / '**gulp build**' #Build all assets
* '**gulp scripts**' #Build everything on the scripts directory
* '**gulp styles**' #Build everything on the styles directory
* '**gulp fonts**' #Build everything on the fonts directory
* '**gulp images**' #Build everything on the images directory
* '**gulp clean**' #Deletes the distribution directory
* '**gulp watch**' #Starts watching the asset files

##### Parameters

You can also pass the following parameters

* '**--sync**' # Starts browserSync. Use only with '**gulp watch**'.
* '**--map**' # Generates .map files
* '**-d**' # Asset debug mode. It won't minify the files.
* '**-p**' # Production mode. File names will be appended with a hash of its content for cache-busting.

### External
* [Sage documentation](https://github.com/roots/sage/) (recommended)
	* Sage 9 uses webpack, please refer to the **8.\*.\*** documentation.
* [RolleiFLEX grid documentation](http://kaisermann.github.io/rolleiflex/)
* [Ruputure: Media Queries with Stylus documentation](http://jescalan.github.io/rupture/)

## Credits and Inspirations

* [Sage Starter Theme](https://github.com/roots/sage/)
