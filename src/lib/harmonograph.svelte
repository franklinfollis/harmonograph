<script lang="ts">
	import { CanvasSpace, Rectangle, Triangle, Pt, Group, Num } from 'pts';
	import { onMount, onDestroy } from 'svelte';

	export let play: boolean = true;

	let canvas: HTMLCanvasElement, space: CanvasSpace;
	let initialPlay: boolean = true;
	let config = {a: 40, f: 0.02};

	function PT() {
		space = new CanvasSpace('#hello');
		space.setup({ bgcolor: '#ddd' });

		const form = space.getForm();
        let chain = new Group();
        let center = new Pt(space.center)


        const sineWave = (x: number, amplitude: number, freq: number) => amplitude * Math.sin(2 * Math.PI * freq * x) + space.center.y


		space.add((time, ftime) => {
            let x = time / 50
			let pt = new Pt(x, sineWave(x, config.a, config.f))
            chain.push(pt)
            form.strokeOnly("#123", 0.5).line(chain)
		});

		space.play();
	}

	onMount(() => PT());
</script>

<canvas id="hello" />
<div>
	<label>
		Amplitude
		<input type="range" bind:value={config.a} min="0" max="400" />
	</label>
</div>
<div>
	<label>
		Wavelength
		<input type="range" bind:value={config.f} min="0" max="0.5" step="0.001"/>
	</label>
</div>

<style>
	canvas {
		width: 50vw;
		height: 50vh;
		border: 3px solid red;
	}
</style>
