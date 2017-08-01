<?php

namespace App\Fields;

use StoutLogic\AcfBuilder\FieldsBuilder;

$banner = new FieldsBuilder('banner');
$banner
    ->addText('title')
    ->addImage('background_image', [
        'return_format' => 'id',
        'wrapper' => [ 'width' => '50%' ]
    ])
    ->addTrueFalse('background_fixed', [
        'label' => 'Fixed',
        'instructions' => "Check to add a parallax effect where the background image doesn't move when scrolling",
        'wrapper' => [ 'width' => '50%' ]
      ])
    ->addWysiwyg('content')
    ->addColorPicker('background_color', [
        'default_value' => '#ffffff',
        'wrapper' => [ 'width' => '50%' ]
    ])
    ->setLocation('post_type', '==', 'page')
        ->or('post_type', '==', 'post');

return $banner;
