<script>
	let radius = 40;
</script>

<div>
<label>
    Radius
	<input type=range bind:value={radius} min=0 max=400>
</label>
</div>

<style>
	label { display: flex }
	input, p { margin: 6px }
</style>