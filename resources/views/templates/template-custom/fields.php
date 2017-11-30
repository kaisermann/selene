<?php

namespace App\Fields;

use StoutLogic\AcfBuilder\FieldsBuilder;

/*
 * ACF Builder documentation: https://github.com/StoutLogic/acf-builder/wiki
 * ACF PHP documentation: https://www.advancedcustomfields.com/resources/register-fields-via-php/
 * Guide to registering ACF fields via PHP: https://bwap.ch/guide-to-registering-acf-fields-via-php/
 */
/*

/** Field Group setup */
$template_custom = new FieldsBuilder('template_custom', [
    'style' => 'seamless',
    'position' => 'acf_after_title',
    'hide_on_screen' => ['the_content'],
]);

/** Fields setup */
$template_custom
    ->addText('title')
    ->addWysiwyg('content');

/** Field Group location setup */
$template_custom
    ->setLocation('page_template', '==', 'template-custom');

return $template_custom;
