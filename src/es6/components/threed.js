import * as THREE from 'three'
import GLTFLoader from 'three-gltf-loader'
import OrbitControls from 'three-orbitcontrols'

export default class EmojidexThreed {
  constructor(EC) {
    this.EC = EC
    this.canvas = null
    this.renderer = null
    this.scenes = []
    this.lookAt = new THREE.Vector3(0, 1, 0)
  }

  initialize(canvasElement) {
    this.canvas = canvasElement
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      alpha: true,
      antialias: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(document.body.clientWidth, document.body.clientHeight)
    this.animate()
  }

  addScene(code, address, element) {
    if (!this.canvas) {
      console.error('Require "initialize(canvasElement)".')
      return
    }

    if (!code) {
      console.error('Emoji code is empty.')
      return
    }

    const scene = new THREE.Scene()
    scene.userData.element = element

    const camera = new THREE.PerspectiveCamera(50)
    camera.position.set(0, 1, 3.5)
    scene.userData.camera = camera

    const controls = new OrbitControls(scene.userData.camera, scene.userData.element)
    scene.userData.controls = controls

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1)
    directionalLight.position.set(10, 10, 10)
    scene.add(directionalLight)
    scene.add(new THREE.AmbientLight(0xFFFFFF, 0.5))

    const loader = new GLTFLoader()
    loader.load(`https://${this.EC.env.cdnAddr}/${address}/${code}.glb`, data => {
      scene.add(data.scene)
    })

    this.scenes.push(scene)
  }

  animate() {
    this.render()
    requestAnimationFrame(() => {
      this.animate()
    })
  }

  render() {
    this.updateSize()
    this.canvas.style.transform = `translateY(${window.scrollY}px)`

    this.renderer.setScissorTest(false)
    this.renderer.clear()
    this.renderer.setScissorTest(true)

    for (let i = 0; i < this.scenes.length; i++) {
      const scene = this.scenes[i]
      const { element, camera } = scene.userData

      const rect = element.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > this.renderer.domElement.clientHeight ||
          rect.right < 0 || rect.left > this.renderer.domElement.clientWidth) {
        return
      }

      const { left, right, top, bottom } = rect
      const width = right - left
      const height = bottom - top
      const y = this.canvas.clientHeight - bottom + this.canvas.getBoundingClientRect().top
      this.renderer.setViewport(left, y, width, height)
      this.renderer.setScissor(left, y, width, height)

      scene.userData.controls.update()
      camera.lookAt(this.lookAt)
      camera.updateMatrixWorld()
      this.renderer.render(scene, camera)
    }
  }

  updateSize() {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false)
    }
  }
}
