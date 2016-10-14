<?php
if (post_password_required()) {
	return;
}
?>

<section id="comments" class="entry__comments">
	<?php if (have_comments()) : ?>
    <ol class="comment-list">
      <?php wp_list_comments(['style' => 'ol', 'short_ping' => true]); ?>
    </ol>
  <?php endif; ?>
</section>
