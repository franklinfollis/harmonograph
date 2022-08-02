<script lang="ts">

	import { CanvasSpace, Rectangle, Triangle, Pt, Group, Num, Mat } from 'pts';
	import { onMount, onDestroy } from 'svelte';
	import { Harmonograph, Pendulum, type PendulumConfig } from './harmonograph';

	export let play: boolean = true;

	let canvas: HTMLCanvasElement, space: CanvasSpace;
	let initialPlay: boolean = true;

	let pendulumConfigs: Array<PendulumConfig> = [
		{ xamplitude: 200, yamplitude: 200, xfrequency: 1, yfrequency: 4, decay: 0.0001, phase: 0 },
		// { xamplitude: 200, yamplitude: 200, xfrequency: 1, yfrequency: 8, decay: 0.0001, phase: 90 }
	];

	function makeHarmonograph(config: Array<PendulumConfig>) {
		return new Harmonograph(config.map((pendulumConfig) => new Pendulum(pendulumConfig)));
	}

	function PT() {
		space = new CanvasSpace('#hello');
		space.setup({ bgcolor: '#fff' });

		const form = space.getForm();
		let chain = new Group();
		let center = new Pt(space.center);

		const MAX_POINTS = 500000;


		//Precompute harmonograph points
		const harm = makeHarmonograph(pendulumConfigs);
		const points = [...Array(MAX_POINTS)].map((_, i) => {
			let v = harm.calculate(i / 5)
			return new Pt(v.x, v.y)
		});

		const delay = 0;
		const pointsToRender = 10;
		let currentFrametime = 0;

		space.add((time, ftime) => {
			if (time != null && ftime != null) {
				currentFrametime += ftime;

				if (currentFrametime >= delay) {
					chain.push(...points.splice(0, pointsToRender).map(v => v.add(space.center)));

					form.stroke("#555", 0.5).point(chain.slice(-1)[0], 1)
					form.strokeOnly('#aaa', 0.5).line(chain);

					currentFrametime = 0;
				}
			}
		});

		space.play();
	}

	onMount(() => PT());
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
		width: 80vw;
		height: 70vh;
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
