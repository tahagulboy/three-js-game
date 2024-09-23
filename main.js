import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

// Sahne ve Kamera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Puan göstergesi
let score = 0;
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';
scoreElement.innerHTML = "Score: " + score;
document.body.appendChild(scoreElement);

// Zemin oluşturma
const geometry = new THREE.PlaneGeometry(100, 100);
const material = new THREE.MeshBasicMaterial({ color: 0x228B22, side: THREE.DoubleSide });
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI / 2; // Zemin yatay olsun
scene.add(plane);

// Blok oluşturma
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cube = new THREE.Mesh(boxGeometry, boxMaterial);
cube.position.y = 0.5; // Blok zeminin üstünde olsun
scene.add(cube);

// Rastgele yuvarlak bloklar oluşturma
const spheres = [];
// Rastgele toplar oluşturma
function createRandomSphere() {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(Math.random() * 50 - 25, 0.5, Math.random() * 50 - 25);
    scene.add(sphere);
    spheres.push(sphere);
}

// Topları düzenli aralıklarla oluşturmak için interval ayarlama
const sphereCreationInterval = 3000; // 3000 ms = 3 saniye
setInterval(createRandomSphere, sphereCreationInterval);

// Kamera pozisyonu başlangıçta ayarla
camera.position.set(0, 5, 10);
camera.lookAt(cube.position);

// Hareket hızını belirle
const moveSpeed = 0.1;

// Klavye tuşlarını takip et
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false
};

// Klavye tuşuna basıldığında
window.addEventListener('keydown', function(event) {
    if (event.code in keys) {
        keys[event.code] = true;
    }
});

// Klavye tuşu bırakıldığında
window.addEventListener('keyup', function(event) {
    if (event.code in keys) {
        keys[event.code] = false;
    }
});

// Ayak izi eklemek için fonksiyon
function addFootprint(position) {
    const footprintGeometry = new THREE.PlaneGeometry(1, 1);
    const footprintMaterial = new THREE.MeshBasicMaterial({ color: 0xff1493, side: THREE.DoubleSide });
    const footprint = new THREE.Mesh(footprintGeometry, footprintMaterial);
    footprint.rotation.x = Math.PI / 2;
    footprint.position.set(position.x, 0.01, position.z);
    scene.add(footprint);

    setTimeout(() => {
        scene.remove(footprint);
    }, 2000);
}

// Yanıp sönme efekti için renk değiştirici
let flashing = false; // Yanıp sönme işleminin zaten yapılıp yapılmadığını kontrol eden bir bayrak

function flashCubeColor() {
    if (flashing) return; // Eğer zaten yanıp sönme yapılıyorsa, başka bir yanıp sönme başlatma
    flashing = true; // Yanıp sönme işlemini başlat

    const originalColor = cube.material.color.clone(); // Orijinal rengi sakla
    const flashColor = 0xffd700; // Yanıp sönme rengi
    let isFlashing = true;

    // Yanıp sönme efekti
    const flashInterval = setInterval(() => {
        cube.material.color.set(isFlashing ? flashColor : originalColor); // Rengi değiştir
        isFlashing = !isFlashing;
    }, 200); // Her 200 ms'de bir değişim

    setTimeout(() => {
        clearInterval(flashInterval); // Yanıp sönmeyi durdur
        cube.material.color.set(originalColor); // Orijinal rengi geri yükle
        flashing = false; // Yanıp sönme işlemi bitti
    }, 2000); // 2 saniyelik süre
}

// Çarpışma kontrol fonksiyonu
function checkCollision() {
    for (let i = 0; i < spheres.length; i++) {
        const sphere = spheres[i];
        const distance = cube.position.distanceTo(sphere.position);
        if (distance < 1) {
            scene.remove(sphere); // Küreyi sahneden kaldır
            spheres.splice(i, 1); // Küreyi arrayden kaldır
            i--; // Küre array boyutu değiştiği için index ayarlaması
            score += 100; // Puanı arttır
            scoreElement.innerHTML = "Score: " + score; // Puanı güncelle
            flashCubeColor(); // Renk değiştir ve yanıp sönmeyi başlat
        }
    }
}

// Animasyon döngüsü
function animate() {
    requestAnimationFrame(animate);

    // Hareket mantığı
    let movingForward = keys.ArrowUp || keys.KeyW;
    let movingBackward = keys.ArrowDown || keys.KeyS;
    let movingLeft = keys.ArrowLeft || keys.KeyA;
    let movingRight = keys.ArrowRight || keys.KeyD;

    // İleri + sağ hareketi
    if (movingForward && movingRight) {
        cube.rotation.y = -Math.PI / 4;
        cube.position.x += moveSpeed / Math.sqrt(2);
        cube.position.z -= moveSpeed / Math.sqrt(2);
        addFootprint(cube.position);
    } else if (movingForward && movingLeft) {
        cube.rotation.y = Math.PI / 4;
        cube.position.x -= moveSpeed / Math.sqrt(2);
        cube.position.z -= moveSpeed / Math.sqrt(2);
        addFootprint(cube.position);
    } else if (movingBackward && movingRight) {
        cube.rotation.y = -3 * Math.PI / 4;
        cube.position.x += moveSpeed / Math.sqrt(2);
        cube.position.z += moveSpeed / Math.sqrt(2);
        addFootprint(cube.position);
    } else if (movingBackward && movingLeft) {
        cube.rotation.y = 3 * Math.PI / 4;
        cube.position.x -= moveSpeed / Math.sqrt(2);
        cube.position.z += moveSpeed / Math.sqrt(2);
        addFootprint(cube.position);
    } else if (movingForward) {
        cube.rotation.y = 0;
        cube.position.z -= moveSpeed;
        addFootprint(cube.position);
    } else if (movingBackward) {
        cube.rotation.y = Math.PI;
        cube.position.z += moveSpeed;
        addFootprint(cube.position);
    } else if (movingRight) {
        cube.rotation.y = -Math.PI / 2;
        cube.position.x += moveSpeed;
        addFootprint(cube.position);
    } else if (movingLeft) {
        cube.rotation.y = Math.PI / 2;
        cube.position.x -= moveSpeed;
        addFootprint(cube.position);
    }

    checkCollision(); // Çarpışmayı kontrol et

    // Kamera bloğu takip etsin
    camera.position.x = cube.position.x + 5;
    camera.position.y = cube.position.y + 5;
    camera.position.z = cube.position.z + 10;
    camera.lookAt(cube.position);

    renderer.render(scene, camera);
}

animate();

// Ekran boyutu değiştiğinde, boyutları güncelle
window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

window.addEventListener('click', function(event) {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.position.set(cube.position.x, cube.position.y, cube.position.z);

    const direction = new THREE.Vector3();
    cube.getWorldDirection(direction);
    direction.y = 0;
    direction.negate();
    direction.normalize();

    const speed = 0.5;
    sphere.userData.velocity = direction.multiplyScalar(speed);

    scene.add(sphere);

    function updateSphere() {
        sphere.position.add(sphere.userData.velocity);
        
        if (sphere.position.length() > 100) {
            scene.remove(sphere);
        } else {
            // Topun düşmanlarla çarpışmasını kontrol et
            enemies.forEach((enemy, index) => {
                if (sphere.position.distanceTo(enemy.position) < 1) {
                    enemy.health -= 20; // Düşmanın canını azalt
                    console.log("Enemy Hit! Current Health:", enemy.health);
                    scene.remove(sphere); // Topu kaldır

                    // Eğer düşmanın canı sıfıra düşerse yok et
                    if (enemy.health <= 0) {
                        scene.remove(enemy); // Düşmanı kaldır
                        enemies.splice(index, 1); // Düşmanı diziden kaldır
                        console.log("Enemy defeated!");
                    }
                    return; // Çarpışma gerçekleştiğinde döngüyü kır
                }
            });

            requestAnimationFrame(updateSphere); // Devam et
        }
    }
    updateSphere();
});

// Can göstergesi
let health = 100; // Başlangıç canı
const healthElement = document.createElement('div');
healthElement.style.position = 'absolute';
healthElement.style.top = '10px';
healthElement.style.right = '10px';
healthElement.style.color = 'white';
healthElement.style.fontSize = '24px';
healthElement.innerHTML = "Health: " + health;
document.body.appendChild(healthElement);

function updateHealth(amount) {
    health += amount;
    healthElement.innerHTML = "Health: " + health;

    // Can 0'dan az olamaz
    if (health <= 0) {
        console.log("Game Over");
        restartGame(); // Oyun yeniden başlatma fonksiyonu
    }
}

function restartGame() {
    // Düşmanları ve topları kaldır
    enemies.forEach(enemy => scene.remove(enemy));
    enemies.length = 0; // Düşman dizisini temizle

    // Tüm topları kaldır
    const spheres = scene.children.filter(child => child instanceof THREE.Mesh && child.geometry.type === "SphereGeometry");
    spheres.forEach(sphere => scene.remove(sphere));

    // Canı sıfırlama
    health = 100; // Başlangıç canına geri döndür
    healthElement.innerHTML = "Health: " + health;

    // Oyun nesnelerini yeniden oluşturmak için gerekli kodlar buraya eklenebilir
    // Örneğin: createEnemy() veya diğer başlangıç fonksiyonları
}

const enemies = [];

// Düşman oluşturma fonksiyonu
function createEnemy() {
    const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(Math.random() * 50 - 25, 0.5, Math.random() * 50 - 25);
    enemy.health = 50; // Düşmanın canı
    scene.add(enemy);
    enemies.push(enemy);
    
    moveEnemy(enemy); // Düşmanı rastgele hareket ettir
}

// Düşmanları rastgele hareket ettirmek için
function moveEnemy(enemy) {
    const moveSpeed = 0.02; // Düşmanın hareket hızı

    // Rastgele bir yön belirle
    const randomDirection = new THREE.Vector3(
        Math.random() - 0.5, // X yönü
        0, // Y yönü sabit
        Math.random() - 0.5  // Z yönü
    ).normalize(); // Yönü normalize et

    // Düşmanın hareket etmesi için sürekli güncelle
    function updateEnemy() {
        enemy.position.add(randomDirection.clone().multiplyScalar(moveSpeed));

        // Düşman sahnenin sınırlarını aşmamalı
        enemy.position.x = Math.max(-50, Math.min(50, enemy.position.x));
        enemy.position.z = Math.max(-50, Math.min(50, enemy.position.z));

        requestAnimationFrame(updateEnemy); // Devam et
    }

    updateEnemy(); // Düşmanın hareketini başlat
}

// Düşmanları düzenli aralıklarla oluşturmak için interval ayarlama
setInterval(createEnemy, 5000); // Her 5 saniyede bir düşman oluştur

function createEnemySphere(enemy) {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.position.set(enemy.position.x, enemy.position.y, enemy.position.z);

    // Topun fırlatma yönü
    const direction = new THREE.Vector3();
    direction.subVectors(cube.position, enemy.position); // Düşmandan karaktere
    direction.y = 0; // Dikey hareketi sıfırla
    direction.normalize();

    const speed = 0.5;
    sphere.userData.velocity = direction.multiplyScalar(speed);

    scene.add(sphere);

    function updateSphere() {
        sphere.position.add(sphere.userData.velocity);
        
        // Eğer top sahneden çıkarsa
        if (sphere.position.length() > 100) {
            scene.remove(sphere);
            return;
        }

        // Topun karakterle çarpışmasını kontrol et
        const distance = sphere.position.distanceTo(cube.position);
        if (distance < 1) {
            updateHealth(-10); // Canı azalt
            scene.remove(sphere); // Topu kaldır
            console.log("Hit! Current Health:", health); // Hata ayıklama
            return;
        }

        requestAnimationFrame(updateSphere); // Devam et
    }
    updateSphere();
}

function enemyAttack() {
    enemies.forEach(enemy => {
        createEnemySphere(enemy); // Her düşman için top oluştur
    });
}

// Düşmanların top fırlatmasını her 2 saniyede bir sağlamak için
setInterval(enemyAttack, 2000);


