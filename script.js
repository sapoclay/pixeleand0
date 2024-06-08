document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector(".container");
    const colorPicker = document.querySelector("#colorPicker");
    const sizeSelector = document.querySelector("#sizeSelector");
    const clearButton = document.querySelector("#clearButton");
    const downloadButton = document.querySelector("#downloadButton");
    const fileNameInput = document.querySelector("#fileNameInput");
    const paintBucketButton = document.querySelector("#paintBucketButton");
    const brushButton = document.querySelector("#brushButton");
    const zoomInButton = document.querySelector("#zoomInButton");
    const zoomOutButton = document.querySelector("#zoomOutButton");
    const colorButtons = document.querySelectorAll(".color-button");
    const openButton = document.querySelector("#openButton");
    const imageUpload = document.querySelector("#imageUpload");
    const eyedropperButton = document.querySelector("#eyedropperButton");
    let isPaintBucketActive = false;
    let isBrushActive = true;
    let isEyedropperActive = false;
    let isDrawing = false;
    let activeColor = "#000000";
    let pixelSize = 20;
    let maxSize = parseInt(sizeSelector.value);

    

    // Generar los píxeles
    function generatePixels(size) {
        container.innerHTML = ''; // Limpiar la cuadrícula
        container.style.gridTemplateColumns = `repeat(${size}, ${pixelSize}px)`; // Ajustar el número de columnas
        for (let i = 0; i < size * size; i++) {
            const pixel = document.createElement("div");
            pixel.classList.add("pixel");
            pixel.style.width = `${pixelSize}px`;
            pixel.style.height = `${pixelSize}px`;
            pixel.style.backgroundColor = "#fff"; // Fondo blanco inicial
            container.appendChild(pixel);
        }
    }

    // Obtener píxeles adyacentes del mismo color
    function getAdjacentPixels(pixel, color) {
        const pixels = Array.from(container.children);
        const size = Math.sqrt(pixels.length);
        const index = pixels.indexOf(pixel);
        const queue = [index];
        const result = [];

        while (queue.length > 0) {
            const current = queue.shift();
            if (result.includes(current)) continue;

            const x = current % size;
            const y = Math.floor(current / size);

            if (pixels[current].style.backgroundColor === color) {
                result.push(current);
                if (x > 0) queue.push(current - 1);
                if (x < size - 1) queue.push(current + 1);
                if (y > 0) queue.push(current - size);
                if (y < size - 1) queue.push(current + size);
            }
        }

        return result;
    }

    // Pintar píxeles adyacentes del mismo color
    function paintAdjacentPixels(pixel, color) {
        const pixels = Array.from(container.children);
        const originalColor = pixel.style.backgroundColor;
        const adjacentPixels = getAdjacentPixels(pixel, originalColor);

        adjacentPixels.forEach(index => {
            pixels[index].style.backgroundColor = color;
        });
    }

    // Cambiar color del pixel al hacer clic
    container.addEventListener("mousedown", function(event) {
        if (event.target.classList.contains("pixel")) {
            isDrawing = true;
            if (isPaintBucketActive) {
                paintAdjacentPixels(event.target, activeColor);
            } else if (isEyedropperActive) {
                activeColor = event.target.style.backgroundColor;
                const activeButton = document.querySelector(".color-button.active");
                activeButton.style.backgroundColor = activeColor;
                colorPicker.value = rgbToHex(activeColor);
                isEyedropperActive = false; // Desactivar el cuentagotas después de usarlo
                eyedropperButton.classList.remove("active");
                container.classList.remove("eyedropper-active");
            } else {
                event.target.style.backgroundColor = activeColor;
            }
        }
    });

    container.addEventListener("mouseover", function(event) {
        if (isDrawing && event.target.classList.contains("pixel")) {
            if (isBrushActive) {
                event.target.style.backgroundColor = activeColor;
            }
        }
    });

    container.addEventListener("mouseup", function() {
        isDrawing = false;
    });

    // Activar/desactivar la herramienta del bote de pintura
    paintBucketButton.addEventListener("click", function() {
        isPaintBucketActive = true;
        isBrushActive = false;
        isEyedropperActive = false;
        paintBucketButton.classList.add("active");
        brushButton.classList.remove("active");
        eyedropperButton.classList.remove("active");
        container.classList.remove("eyedropper-active");
    });

    // Activar la herramienta de pincel
    brushButton.addEventListener("click", function() {
        isBrushActive = true;
        isPaintBucketActive = false;
        isEyedropperActive = false;
        brushButton.classList.add("active");
        paintBucketButton.classList.remove("active");
        eyedropperButton.classList.remove("active");
        container.classList.remove("eyedropper-active");
    });

    // Activar la herramienta de cuentagotas
    eyedropperButton.addEventListener("click", function() {
        isEyedropperActive = true;
        isBrushActive = false;
        isPaintBucketActive = false;
        eyedropperButton.classList.add("active");
        brushButton.classList.remove("active");
        paintBucketButton.classList.remove("active");
        container.classList.add("eyedropper-active");
    });

    // Borrar todos los píxeles
    clearButton.addEventListener("click", function() {
        const pixels = document.querySelectorAll(".pixel");
        pixels.forEach(pixel => {
            pixel.style.backgroundColor = "#fff";
        });
        // Limpiar el input de nombre de archivo
        fileNameInput.value = "";
    });

    // Descargar la imagen
    downloadButton.addEventListener("click", async function() {
        const size = parseInt(sizeSelector.value);

        // Crear el canvas para generar la imagen
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;

        // Deshabilitar el anti-aliasing
        ctx.imageSmoothingEnabled = false;

        // Generar la imagen en el canvas
        const pixels = document.querySelectorAll(".pixel");
        let index = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const pixel = pixels[index++];
                const color = pixel.style.backgroundColor || "#ffffff";
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1); // Pintar un píxel en el lienzo
            }
        }

        // Convertir el canvas a Blob
        canvas.toBlob(async function(blob) {
            let fileName = fileNameInput.value.trim() || "pixelart";
            fileName += ".png";
            const url = URL.createObjectURL(blob);

            // Crear un enlace oculto y simular un clic
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();

            // Limpiar
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, "image/png");
    });

    // Generar los píxeles con el tamaño por defecto
    generatePixels(maxSize);

    // Refrescar la página cuando el usuario selecciona un nuevo tamaño de lienzo
    sizeSelector.addEventListener("change", function() {
        maxSize = parseInt(sizeSelector.value);
        generatePixels(maxSize);
    });

    // Cambiar color activo
    colorButtons.forEach(button => {
        button.addEventListener("click", function() {
            colorButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            activeColor = button.style.backgroundColor;
            colorPicker.value = rgbToHex(activeColor);
            console.log("Color activo seleccionado desde botones:", activeColor);
        });

        // Permitir cambiar el color del botón con doble clic
        button.addEventListener("dblclick", function() {
            const tempColorPicker = document.createElement("input");
            tempColorPicker.type = "color";
            tempColorPicker.value = button.style.backgroundColor;
            tempColorPicker.style.position = "absolute";
            tempColorPicker.style.left = "-9999px"; // Moverlo fuera de la pantalla

            tempColorPicker.addEventListener("change", function() {
                button.style.backgroundColor = tempColorPicker.value;
                activeColor = tempColorPicker.value;
                colorPicker.value = tempColorPicker.value;
            });

            document.body.appendChild(tempColorPicker);
            tempColorPicker.click();
            document.body.removeChild(tempColorPicker); // Eliminar después de usar
        });
    });

    // Inicializar el color activo
    colorButtons[0].classList.add("active");
    activeColor = colorButtons[0].style.backgroundColor;

    // Funcionalidad de Zoom In
    zoomInButton.addEventListener("click", function() {
        pixelSize += 5;
        adjustPixelSize();
    });

    // Funcionalidad de Zoom Out
    zoomOutButton.addEventListener("click", function() {
        if (pixelSize > 5) {
            pixelSize -= 5;
            adjustPixelSize();
        }
    });

    // Ajustar el tamaño de los píxeles
    function adjustPixelSize() {
        const pixels = document.querySelectorAll(".pixel");
        pixels.forEach(pixel => {
            pixel.style.width = `${pixelSize}px`;
            pixel.style.height = `${pixelSize}px`;
        });
        container.style.gridTemplateColumns = `repeat(${maxSize}, ${pixelSize}px)`;
        container.style.gridTemplateRows = `repeat(${maxSize}, ${pixelSize}px)`;
    }

    // Cargar imagen desde el botón "Abrir"
    openButton.addEventListener("click", function() {
        imageUpload.click();
    });

    imageUpload.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Ajustar el tamaño del lienzo al tamaño de la imagen
                    maxSize = img.width > img.height ? img.width : img.height;
                    pixelSize = container.clientWidth / maxSize;
                    generatePixels(maxSize);

                    // Dibujar la imagen en la cuadrícula de píxeles
                    const ctx = document.createElement("canvas").getContext("2d");
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
                    const pixels = container.querySelectorAll(".pixel");
                    for (let i = 0; i < pixels.length; i++) {
                        const r = imageData[i * 4];
                        const g = imageData[i * 4 + 1];
                        const b = imageData[i * 4 + 2];
                        const a = imageData[i * 4 + 3] / 255;
                        pixels[i].style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Actualizar el color activo al cambiar el input de color
    colorPicker.addEventListener("input", function() {
        activeColor = colorPicker.value;
        console.log("Color activo seleccionado:", activeColor);
        const activeButton = document.querySelector(".color-button.active");
        if (activeButton) {
            activeButton.style.backgroundColor = activeColor;
        }
    });

    // Función para convertir RGB a HEX
    function rgbToHex(rgb) {
        const rgbArray = rgb.match(/\d+/g).map(Number);
        const hex = rgbArray.map(value => {
            const hexValue = value.toString(16);
            return hexValue.length === 1 ? "0" + hexValue : hexValue;
        });
        return `#${hex.join("")}`;
    }
});