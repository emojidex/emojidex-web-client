import * as THREE from 'three'
import GLTFLoader from 'three-gltf-loader'
import OrbitControls from 'three-orbitcontrols'

export default class EmojidexThreed {
  constructor(EC) {
    this.EC = EC
    this.lookAt = new THREE.Vector3(0, 1, 0)
  }

  createCanvasData(code, address, canvas, size) {
    if (!code) {
      console.error('Emoji code is empty.')
      return
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(size, size)
    renderer.gammaOutput = true

    const camera = new THREE.PerspectiveCamera(50, size / size)
    camera.position.set(0, 1, 3)
    const controls = new OrbitControls(camera, canvas)

    const scene = new THREE.Scene()
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF)
    directionalLight.intensity = 1
    directionalLight.position.set(10, 10, 10)
    scene.add(directionalLight)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF)
    ambientLight.intensity = 0.5
    scene.add(ambientLight)

    const loader = new GLTFLoader()
    loader.load(`https://${this.EC.env.cdnAddr}/${address}/${code}.glb`, data => {
      scene.add(data.scene)
    })

    const update = () => {
      requestAnimationFrame(() => {
        update()
      })

      controls.update()
      camera.lookAt(this.lookAt)
      camera.updateMatrixWorld()
      renderer.render(scene, camera)
    }

    update()
  }
}
