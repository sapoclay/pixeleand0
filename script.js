// Esperar a que se cargue el DOM antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function() {
    // Obtener referencias a los elementos del DOM
    const container = document.querySelector(".container"); // Contenedor de píxeles
    const colorPicker = document.querySelector("#colorPicker"); // Selector de color
    const sizeSelector = document.querySelector("#sizeSelector"); // Selector de tamaño
    const clearButton = document.querySelector("#clearButton"); // Botón de limpiar
    const downloadButton = document.querySelector("#downloadButton"); // Botón de descargar
    const fileNameInput = document.querySelector("#fileNameInput"); // Entrada de nombre de archivo
    const paintBucketButton = document.querySelector("#paintBucketButton"); // Botón de cubo de pintura
    const brushButton = document.querySelector("#brushButton"); // Botón de pincel
    const zoomInButton = document.querySelector("#zoomInButton"); // Botón de hacer zoom
    const zoomOutButton = document.querySelector("#zoomOutButton"); // Botón de alejar
    const colorButtons = document.querySelectorAll(".color-button"); // Botones de color
    const openButton = document.querySelector("#openButton"); // Botón de abrir imagen
    const imageUpload = document.querySelector("#imageUpload"); // Entrada de carga de imagen
    const eyedropperButton = document.querySelector("#eyedropperButton"); // Botón de cuentagotas
    const undoButton = document.querySelector("#undoButton"); // Botón de deshacer

    // Variables de estado y configuración inicial
    let isPaintBucketActive = false; // Estado de activación del cubo de pintura
    let isBrushActive = true; // Estado de activación del pincel
    let isEyedropperActive = false; // Estado de activación del cuentagotas
    let isDrawing = false; // Estado de dibujo
    let activeColor = "#000000"; // Color activo inicial
    let pixelSize = 20; // Tamaño de píxel inicial
    let maxSize = parseInt(sizeSelector.value); // Tamaño máximo inicial
    let history = []; // Historial de acciones

    // Generar los píxeles en el contenedor
    function generatePixels(size) {
        container.innerHTML = ''; // Limpiar el contenedor
        container.style.gridTemplateColumns = `repeat(${size}, ${pixelSize}px)`; // Establecer el número de columnas
        for (let i = 0; i < size * size; i++) {
            const pixel = document.createElement("div"); // Crear un píxel
            pixel.classList.add("pixel");
            pixel.style.width = `${pixelSize}px`; // Establecer el tamaño
            pixel.style.height = `${pixelSize}px`;
            pixel.style.backgroundColor = "#fff"; // Color inicial
            container.appendChild(pixel); // Agregar píxel al contenedor
        }
    }

    // Obtener los píxeles adyacentes del mismo color
    function getAdjacentPixels(pixel, color) {
        const pixels = Array.from(container.children); // Obtener todos los píxeles
        const size = Math.sqrt(pixels.length); // Calcular el tamaño de la cuadrícula
        const index = pixels.indexOf(pixel); // Obtener el índice del píxel
        const queue = [index]; // Inicializar la cola de píxeles
        const result = []; // Inicializar el resultado

        while (queue.length > 0) {
            const current = queue.shift(); // Obtener el próximo píxel de la cola
            if (result.includes(current)) continue; // Si ya está en el resultado, continuar

            const x = current % size; // Calcular la coordenada x
            const y = Math.floor(current / size); // Calcular la coordenada y

            if (pixels[current].style.backgroundColor === color) {
                // Si el color del píxel es el mismo que el color dado
                result.push(current); // Agregar el índice al resultado
                // Agregar los píxeles adyacentes a la cola
                if (x > 0) queue.push(current - 1); // Izquierda
                if (x < size - 1) queue.push(current + 1); // Derecha
                if (y > 0) queue.push(current - size); // Arriba
                if (y < size - 1) queue.push(current + size); // Abajo
            }
        }

        return result; // Devolver los píxeles adyacentes del mismo color
    }

    // Pintar los píxeles adyacentes del mismo color
    function paintAdjacentPixels(pixel, color) {
        const pixels = Array.from(container.children); // Obtener todos los píxeles
        const originalColor = pixel.style.backgroundColor; // Obtener el color original del píxel
        const adjacentPixels = getAdjacentPixels(pixel, originalColor); // Obtener los píxeles adyacentes del mismo color

        // Iterar sobre los píxeles adyacentes
        adjacentPixels.forEach(index => {
            const targetPixel = pixels[index]; // Obtener el píxel objetivo
            // Agregar la acción al historial
            history.push({
                pixel: targetPixel,
                previousColor: targetPixel.style.backgroundColor,
                newColor: color
            });
            targetPixel.style.backgroundColor = color; // Pintar el píxel
        });
    }

    // Manejador de eventos: clic en el contenedor de píxeles
    container.addEventListener("mousedown", function(event) {
        if (event.target.classList.contains("pixel")) {
            isDrawing = true; // Iniciar el dibujo
            if (isPaintBucketActive) {
                // Si el cubo de pintura está activo
                paintAdjacentPixels(event.target, activeColor); // Pintar píxeles adyacentes del mismo color
            } else if (isEyedropperActive) {
                // Si el cuentagotas está activo
                activeColor = event.target.style.backgroundColor; // Obtener el color del píxel
                const activeButton = document.querySelector(".color-button.active"); // Obtener el botón de color activo
                activeButton.style.backgroundColor = activeColor; // Establecer el color activo en el botón
                colorPicker.value = rgbToHex(activeColor); // Establecer el valor del selector de color
                isEyedropperActive = false; // Desactivar el cuentagotas
                eyedropperButton.classList.remove("active"); // Eliminar la clase activa del botón de cuentagotas
                container.classList.remove("eyedropper-active"); // Eliminar la clase activa del contenedor
            } else {
                // Si se está utilizando el pincel
                const targetPixel = event.target; // Obtener el píxel objetivo
                // Agregar la acción al historial
                history.push({
                    pixel: targetPixel,
                    previousColor: targetPixel.style.backgroundColor,
                    newColor: activeColor
                });
                targetPixel.style.backgroundColor = activeColor;
            }
        }
    });

    // Manejador de eventos: movimiento del ratón sobre el contenedor de píxeles
    container.addEventListener("mouseover", function(event) {
        if (isDrawing && event.target.classList.contains("pixel")) {
            if (isBrushActive) {
                const targetPixel = event.target; // Obtener el píxel objetivo
                // Agregar la acción al historial
                history.push({
                    pixel: targetPixel,
                    previousColor: targetPixel.style.backgroundColor,
                    newColor: activeColor
                });
                targetPixel.style.backgroundColor = activeColor; // Pintar el píxel
            }
        }
    });

    // Manejador de eventos: liberación del botón del ratón sobre el contenedor de píxeles
    container.addEventListener("mouseup", function() {
        isDrawing = false; // Finalizar el dibujo
    });

    // Manejador de eventos: salida del ratón del contenedor de píxeles
    container.addEventListener("mouseleave", function() {
        isDrawing = false; // Finalizar el dibujo
    });

    // Manejador de eventos: clic en el botón "Paint Bucket"
    paintBucketButton.addEventListener("click", function() {
        isPaintBucketActive = true; // Activar el cubo de pintura
        isBrushActive = false; // Desactivar el pincel
        isEyedropperActive = false; // Desactivar el cuentagotas
        paintBucketButton.classList.add("active"); // Agregar clase activa al botón de cubo de pintura
        brushButton.classList.remove("active"); // Eliminar clase activa del botón de pincel
        eyedropperButton.classList.remove("active"); // Eliminar clase activa del botón de cuentagotas
        container.classList.remove("eyedropper-active"); // Eliminar clase activa del contenedor
    });

    // Manejador de eventos: clic en el botón "Brush"
    brushButton.addEventListener("click", function() {
        isBrushActive = true; // Activar el pincel
        isPaintBucketActive = false; // Desactivar el cubo de pintura
        isEyedropperActive = false; // Desactivar el cuentagotas
        brushButton.classList.add("active"); // Agregar clase activa al botón de pincel
        paintBucketButton.classList.remove("active"); // Eliminar clase activa del botón de cubo de pintura
        eyedropperButton.classList.remove("active"); // Eliminar clase activa del botón de cuentagotas
        container.classList.remove("eyedropper-active"); // Eliminar clase activa del contenedor
    });

    // Manejador de eventos: clic en el botón "Eyedropper"
    eyedropperButton.addEventListener("click", function() {
        isEyedropperActive = true; // Activar el cuentagotas
        isBrushActive = false; // Desactivar el pincel
        isPaintBucketActive = false; // Desactivar el cubo de pintura
        eyedropperButton.classList.add("active"); // Agregar clase activa al botón de cuentagotas
        brushButton.classList.remove("active"); // Eliminar clase activa del botón de pincel
        paintBucketButton.classList.remove("active"); // Eliminar clase activa del botón de cubo de pintura
        container.classList.add("eyedropper-active"); // Agregar clase activa al contenedor
    });

    // Manejador de eventos: clic en el botón "Clear"
    clearButton.addEventListener("click", function() {
        const pixels = document.querySelectorAll(".pixel"); // Obtener todos los píxeles
        pixels.forEach(pixel => {
            pixel.style.backgroundColor = "#fff"; // Restablecer el color a blanco
        });
        fileNameInput.value = ""; // Limpiar el valor de la entrada de nombre de archivo
        history = []; // Limpiar el historial de acciones
    });

    // Manejador de eventos: clic en el botón "Download"
    downloadButton.addEventListener("click", async function() {
        const size = parseInt(sizeSelector.value);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;
        ctx.imageSmoothingEnabled = false;

        const pixels = document.querySelectorAll(".pixel"); // Obtener todos los píxeles
        for (let i = 0; i < pixels.length; i++) {
            const x = i % size; // Calcular la coordenida x
            const y = Math.floor(i / size); // Calcular la coordenada y
            const color = pixels[i].style.backgroundColor; // Obtener el color del píxel
            ctx.fillStyle = color; // Establecer el color de relleno
            ctx.fillRect(x, y, 1, 1); // Dibujar un píxel
        }

        const link = document.createElement("a"); // Crear un elemento de enlace
        link.download = fileNameInput.value ? fileNameInput.value + ".png" : "pixel-art.png"; // Establecer el nombre de archivo para descargar
        link.href = canvas.toDataURL(); // Establecer el enlace de descarga
        link.click(); // Simular clic en el enlace
    });

    // Manejador de eventos: cambio en el selector de tamaño
    sizeSelector.addEventListener("change", function() {
        maxSize = parseInt(sizeSelector.value); // Actualizar el tamaño máximo
        generatePixels(maxSize); // Generar los píxeles
        history = []; // Limpiar el historial de acciones
    });

    // Manejador de eventos: clic en el botón "Zoom In"
    zoomInButton.addEventListener("click", function() {
        pixelSize += 5; // Aumentar el tamaño de píxel
        adjustPixelSize(); // Ajustar el tamaño de los píxeles
    });

    // Manejador de eventos: clic en el botón "Zoom Out"
    zoomOutButton.addEventListener("click", function() {
        if (pixelSize > 5) { // Verificar que el tamaño de píxel no sea menor que 5
            pixelSize -= 5; // Disminuir el tamaño de píxel
            adjustPixelSize(); // Ajustar el tamaño de los píxeles
        }
    });

    // Función para ajustar el tamaño de los píxeles
    function adjustPixelSize() {
        const pixels = document.querySelectorAll(".pixel"); // Obtener todos los píxeles
        pixels.forEach(pixel => {
            pixel.style.width = `${pixelSize}px`; // Establecer el ancho del píxel
            pixel.style.height = `${pixelSize}px`; // Establecer la altura del píxel
        });
        container.style.gridTemplateColumns = `repeat(${maxSize}, ${pixelSize}px)`; // Establecer las columnas de la cuadrícula
        container.style.gridTemplateRows = `repeat(${maxSize}, ${pixelSize}px)`; // Establecer las filas de la cuadrícula
    }

    // Manejador de eventos: clic en el botón "Open"
    openButton.addEventListener("click", function() {
        imageUpload.click(); // Simular clic en la entrada de carga de imagen
    });

    // Manejador de eventos: cambio en la entrada de carga de imagen
    imageUpload.addEventListener("change", function(event) {
        const file = event.target.files[0]; // Obtener el archivo seleccionado
        if (file) {
            const reader = new FileReader(); // Crear un lector de archivos
            reader.onload = function(e) {
                const img = new Image(); // Crear una imagen
                img.onload = function() {
                    // Redimensionar el lienzo al tamaño de la imagen
                    const scaleFactor = Math.min(container.clientWidth / img.width, container.clientHeight / img.height);
                    const newWidth = Math.floor(img.width * scaleFactor);
                    const newHeight = Math.floor(img.height * scaleFactor);
                    maxSize = Math.max(newWidth, newHeight);
                    pixelSize = container.clientWidth / maxSize;
                    generatePixels(maxSize);

                    // Dibujar la imagen en la cuadrícula de píxeles
                    const ctx = document.createElement("canvas").getContext("2d"); // Obtener el contexto 2D
                    ctx.canvas.width = img.width; // Establecer el ancho del lienzo
                    ctx.canvas.height = img.height; // Establecer la altura del lienzo
                    ctx.drawImage(img, 0, 0, img.width, img.height); // Dibujar la imagen en el lienzo
                    const imageData = ctx.getImageData(0, 0, img.width, img.height).data; // Obtener los datos de imagen
                    const pixels = container.querySelectorAll(".pixel"); // Obtener todos los píxeles de la cuadrícula
                    for (let y = 0; y < newHeight; y++) {
                        for (let x = 0; x < newWidth; x++) {
                            const i = (y * img.width + x) * 4; // Calcular el índice de los datos de imagen
                            const r = imageData[i]; // Componente rojo
                            const g = imageData[i + 1]; // Componente verde
                            const b = imageData[i + 2]; // Componente azul
                            const a = imageData[i + 3] / 255; // Componente alfa
                            const pixel = pixels[y * maxSize + x]; // Obtener el píxel correspondiente
                            if (pixel) {
                                pixel.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`; // Establecer el color del píxel
                            }
                        }
                    }
                    history = []; // Limpiar el historial al abrir una nueva imagen
                };
                img.src = e.target.result; // Establecer la fuente de la imagen
            };
            reader.readAsDataURL(file); // Leer el archivo como URL de datos
        }
    });

    // Manejador de eventos: cambio en el selector de color
    colorPicker.addEventListener("input", function() {
        activeColor = colorPicker.value; // Actualizar el color activo
        const activeButton = document.querySelector(".color-button.active"); // Obtener el botón de color activo
        if (activeButton) {
            activeButton.style.backgroundColor = activeColor; // Establecer el color activo en el botón
        }
    });

    // Función para convertir RGB a código hexadecimal
    function rgbToHex(rgb) {
        const rgbArray = rgb.match(/\d+/g).map(Number); // Obtener los componentes RGB como números
        const hex = rgbArray.map(value => {
            const hexValue = value.toString(16); // Convertir a hexadecimal
            return hexValue.length === 1 ? "0" + hexValue : hexValue; // Agregar ceros a la izquierda si es necesario
        });
        return `#${hex.join("")}`; // Devolver el código hexadecimal
    }
    // Verificar si hay botones de color
    if (colorButtons.length > 0) {
        colorButtons[0].classList.add("active");
        activeColor = colorButtons[0].style.backgroundColor;
        colorPicker.value = rgbToHex(activeColor);
    }

     // Asignar manejadores de eventos a los botones de color
     colorButtons.forEach(button => {
        button.addEventListener("click", function() {
            colorButtons.forEach(btn => btn.classList.remove("active")); // Desactivar todos los botones de color
            button.classList.add("active"); // Activar el botón seleccionado
            activeColor = button.style.backgroundColor; // Actualizar el color activo
            colorPicker.value = rgbToHex(activeColor); // Actualizar el selector de color
        });
    });

    // Manejador de eventos: clic en el botón "Undo"
    undoButton.addEventListener("click", function() {
        if (history.length > 0) { // Verificar si hay acciones en el historial
            const lastAction = history.pop(); // Obtener la última acción del historial
            lastAction.pixel.style.backgroundColor = lastAction.previousColor; // Restaurar el color anterior del píxel
        }
    });

    // Generar los píxeles iniciales
    generatePixels(maxSize);
});