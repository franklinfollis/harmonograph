<script>
    import Harmonograph from '$lib/harmonograph.svelte'
	let name = 'Francis';
</script>

<main>
    <div>
	<h1>Hey {name}! Welcome to SvelteKit.</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
    <Harmonograph />
</div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        width: 100vw;
        align-items: center;
        justify-content: center;
    }
</style>
