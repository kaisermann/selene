<?php

namespace App\Fields;

use StoutLogic\AcfBuilder\FieldsBuilder;

/*
 * ACF Builder documentation: https://github.com/StoutLogic/acf-builder/wiki
 * ACF PHP documentation: https://www.advancedcustomfields.com/resources/register-fields-via-php/
 * Guide to registering ACF fields via PHP: https://bwap.ch/guide-to-registering-acf-fields-via-php/
 * Use the 'ACF_FIELDS_DIR' constant to reference the app/fields directory (for partials inclusions)
 */
/*

/** Field Group setup */
$sample_field = new FieldsBuilder('sample_field', [
    'hide_on_screen' => ['the_content'],
]);

/** Fields setup */
$sample_field
    ->addText('title')
    ->addWysiwyg('content');


/** Field Group location setup */
$sample_field
    ->setLocation('page_template', '==', 'views/template-custom.blade.php')
        ->or('post_type', '==', 'post');

// return $sample_field;
