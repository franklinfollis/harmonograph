<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Scene,
		WebGLRenderer,
		PerspectiveCamera,
		LineBasicMaterial,
		Vector3,
		BufferGeometry,
		Line,
		MathUtils
	} from 'three';
	import Stats from 'three/examples/jsm/libs/stats.module';
	import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';
	import { Line2 } from 'three/examples/jsm/lines/Line2.js';
	import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
	import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
	import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

	import { Harmonograph, Pendulum, type PendulumConfig } from './harmonograph';

	export let play: boolean = true;

	let harmConfig = {
		cinematic: true,
		radius: 1000,
		drawSpeed: 30,
		pendulumConfigs: [
			{
				xamplitude: 200,
				yamplitude: 200,
				zamplitude: 200,
				xfrequency: 1,
				yfrequency: 4,
				zfrequency: 2,
				decay: 0.0001,
				phase: 0
			}
		]
	};

	function makeHarmonograph(config: Array<PendulumConfig>) {
		return new Harmonograph(config.map((pendulumConfig) => new Pendulum(pendulumConfig)));
	}

	function THREE() {
		const canvas = document.getElementById('hello') as HTMLCanvasElement;
		const context = canvas.getContext('webgl2', { antialias: true }) as WebGLRenderingContext;

		const renderer = new WebGLRenderer({ canvas, antialias: true });
		renderer.setSize(canvas.clientWidth, canvas.clientHeight);

		const camera = new CinematicCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 5000);
		camera.setLens(5);
		camera.position.set(harmConfig.radius, harmConfig.radius, harmConfig.radius);

		const effectController = {
			focalLength: 15,
			// jsDepthCalculation: true,
			// shaderFocus: false,
			//
			fstop: 8,
			// maxblur: 1.0,
			//
			showFocus: false,
			focalDepth: 3
			// manualdof: false,
			// vignetting: false,
			// depthblur: false,
			//
			// threshold: 0.5,
			// gain: 2.0,
			// bias: 0.5,
			// fringe: 0.7,
			//
			// focalLength: 35,
			// noise: true,
			// pentagon: false,
			//
			// dithering: 0.0001
		};

		const matChanger = function () {
			for (const e in effectController) {
				if (e in camera.postprocessing.bokeh_uniforms) {
					camera.postprocessing.bokeh_uniforms[e].value = effectController[e];
				}
			}

			camera.postprocessing.bokeh_uniforms['znear'].value = camera.near;
			camera.postprocessing.bokeh_uniforms['zfar'].value = camera.far;
			camera.setLens(
				effectController.focalLength,
				camera.getFilmHeight(),
				effectController.fstop,
				camera.coc
			);
			effectController['focalDepth'] = camera.postprocessing.bokeh_uniforms['focalDepth'].value;
		};

		matChanger();

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enablePan = false;
		controls.update();

		const stats = Stats();
		canvas.appendChild(stats.dom);

		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;

		const scene = new Scene();

		const MAX_POINTS = 500000;

		//Precompute harmonograph points
		const harm = makeHarmonograph(harmConfig.pendulumConfigs);
		let points = [...Array(MAX_POINTS)].map((_, i) => {
			let v = harm.calculate(i / 2);
			return new Vector3(v.x, v.y, v.z);
		});

		let positions: Array<number> = [];
		points.forEach((v) => positions.push(v.x, v.y, v.z));

		let amountToAdd = 50;

		//create a blue LineBasicMaterial
		const material = new LineBasicMaterial({ color: 0xffffff, linewidth: 0.01, opacity: 0.4 });

		let bufferGeometry = new BufferGeometry().setFromPoints(points);
		let lineGeometry = new LineGeometry().setPositions(positions);

		let bufferLine = new Line(bufferGeometry, material);

		let matLine = new LineMaterial({
			color: 0x4080ff,
			linewidth: 5, // in pixels
			vertexColors: true,
			//resolution:  // to be set by renderer, eventually
			dashed: false,
			alphaToCoverage: true
		});

		let line2 = new Line2(lineGeometry, matLine);
		line2.computeLineDistances();
		line2.geometry.scale(1000, 1000, 1000);

		console.log('computedLineDistances!!');

		let line = bufferLine;

		scene.add(line);

		controls.update();

		camera.lookAt(scene.position);

		renderer.render(scene, camera);

		setInterval(() => {
			amountToAdd += harmConfig.drawSpeed;
		}, 10);

		let theta = 0;

		function animate() {
			if (harmConfig.cinematic) {
				theta += 0.1;

				camera.position.x += Math.sin(MathUtils.degToRad(theta));
				camera.position.y += Math.sin(MathUtils.degToRad(theta));
				camera.position.z += Math.cos(MathUtils.degToRad(theta));
			}

			camera.lookAt(scene.position);

			camera.updateMatrixWorld();

			line.geometry.setDrawRange(0, amountToAdd);
			line.geometry.attributes.position.needsUpdate = true;

			requestAnimationFrame(animate);

			controls.update();

			if (camera.postprocessing.enabled) {
				camera.renderCinematic(scene, renderer);
			} else {
				scene.overrideMaterial = null;

				renderer.clear();
				renderer.render(scene, camera);
			}

			stats.update();
		}

		animate();
	}

	onMount(() => THREE());
	onDestroy(() => console.log('destroyed!'));
</script>

<main>
	<canvas id="hello" />
	<div id="controls">
		<div class="flex items-center">
			<input
				id="default-checkbox"
				type="checkbox"
				bind:checked={harmConfig.cinematic}
				class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
			/>
			<label
				for="default-checkbox"
				class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rotate</label
			>
		</div>
		<div class="flex flex-col justify-center">
			<label
				for="draw-speed"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Draw Speed</label
			>
			<input
				id="draw-speed"
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
				type="range"
				bind:value={harmConfig.drawSpeed}
				min={0}
				max={50}
			/>
		</div>
		{#each harmConfig.pendulumConfigs as pconfig, i}
			<div>
				<h3 class="text-md font-extrabold">Pendulum {i + 1}</h3>
				<div>
					<label>
						X Amplitude
						<input
							class="form-input px-2 py-2 rounded-md"
							type="number"
							bind:value={pconfig.xamplitude}
							min="0"
							max="400"
						/>
					</label>
				</div>
				<div>
					<label>
						Y Amplitude
						<input
							class="form-input px-2 py-2 rounded-md"
							type="number"
							bind:value={pconfig.yamplitude}
							min="0"
							max="400"
						/>
					</label>
				</div>
				<div>
					<label>
						X Frequency
						<input
							class="form-input px-2 py-2 rounded-md"
							type="number"
							bind:value={pconfig.xfrequency}
							min="0"
							max="10"
							step="0.5"
						/>
					</label>
				</div>
				<div>
					<label>
						Y Frequency
						<input
							class="form-input px-2 py-2 rounded-md"
							type="number"
							bind:value={pconfig.yfrequency}
							min="0"
							max="10"
							step="0.5"
						/>
					</label>
				</div>
				<div>
					<label>
						Decay
						<input
							class="form-input px-2 py-2 rounded-md"
							type="number"
							bind:value={pconfig.decay}
							min="0"
							max="0.05"
							step="0.001"
						/>
					</label>
				</div>
				<div>
					<label>
						Phase
						<input
							class="form-input px-2 py-2 rounded-md"
							type="number"
							bind:value={pconfig.phase}
							min="0"
							max="180"
							step="1"
						/>
					</label>
				</div>
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		display: flex;
		width: 100vw;
		align-items: center;
		justify-content: center;
	}
	canvas {
		height: 100vh;
		width: 100vw;
	}

	#controls {
		padding: 10px;
		margin: 10px 0px;
		border: 1px solid #cdcdcd;
		border-radius: 5px;
		display: flex;
		flex-direction: column;
		position: fixed;
		right: 10px;
		background-color: white;
	}

	#controls > div {
		padding: 15px;
		justify-items: center;
	}
</style>
