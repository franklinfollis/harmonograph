<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Scene,
		WebGLRenderer,
		PerspectiveCamera,
		LineBasicMaterial,
		Vector3,
		BufferGeometry,
		Line
	} from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

	import { Harmonograph, Pendulum, type PendulumConfig } from './harmonograph';

	export let play: boolean = true;

	let pendulumConfigs: Array<PendulumConfig> = [
		{ xamplitude: 200, yamplitude: 200, xfrequency: 1, yfrequency: 4, decay: 0.0001, phase: 0 }
		// { xamplitude: 200, yamplitude: 200, xfrequency: 1, yfrequency: 8, decay: 0.0001, phase: 90 }
	];

	function makeHarmonograph(config: Array<PendulumConfig>) {
		return new Harmonograph(config.map((pendulumConfig) => new Pendulum(pendulumConfig)));
	}

	function THREE() {
		const canvas = document.getElementById('hello') as HTMLCanvasElement;

		const renderer = new WebGLRenderer({ canvas });
		renderer.setSize(canvas.clientWidth, canvas.clientHeight);

		const camera = new PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 600);
		camera.position.set(0, 0, 500);
		camera.lookAt(0, 0, 0);

		const scene = new Scene();

		const MAX_POINTS = 500000;

		//Precompute harmonograph points
		const harm = makeHarmonograph(pendulumConfigs);
		const points = [...Array(MAX_POINTS)].map((_, i) => {
			let v = harm.calculate(i / 5);
			return new Vector3(v.x, v.y, 0);
		});

		//create a blue LineBasicMaterial
		const material = new LineBasicMaterial({ color: 0x0000ff });

		const geometry = new BufferGeometry().setFromPoints(points);

		const line = new Line(geometry, material);

		scene.add(line);
		renderer.render(scene, camera);

		const controls = new OrbitControls(camera, renderer.domElement);
	}

	onMount(() => THREE());
</script>

<canvas id="hello" />
<div id="controls">
	{#each pendulumConfigs as config, i}
		<div>
			<h3>Pendulum {i + 1}</h3>
			<div>
				<label>
					X Amplitude
					<input type="number" bind:value={config.xamplitude} min="0" max="400" />
				</label>
			</div>
			<div>
				<label>
					Y Amplitude
					<input type="number" bind:value={config.yamplitude} min="0" max="400" />
				</label>
			</div>
			<div>
				<label>
					X Frequency
					<input type="number" bind:value={config.xfrequency} min="0" max="10" step="0.5" />
				</label>
			</div>
			<div>
				<label>
					Y Frequency
					<input type="number" bind:value={config.yfrequency} min="0" max="10" step="0.5" />
				</label>
			</div>
			<div>
				<label>
					Decay
					<input type="number" bind:value={config.decay} min="0" max="0.05" step="0.001" />
				</label>
			</div>
			<div>
				<label>
					Phase
					<input type="number" bind:value={config.phase} min="0" max="180" step="1" />
				</label>
			</div>
		</div>
	{/each}
</div>

<style>
	canvas {
		width: 90vw;
		height: 90vh;
		border: 3px solid red;
	}

	#controls {
		padding: 10px;
		margin: 10px 0px;
		border: 1px solid #cdcdcd;
		border-radius: 5px;
		display: flex;
	}

	#controls > div {
		padding: 15px;
		justify-items: center;
	}
</style>
