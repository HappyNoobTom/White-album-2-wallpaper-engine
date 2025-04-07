// Wallpaper Engine slideshow script
// Divides the screen into three regions, each with its own slideshow

// Configuration
const SCREEN_WIDTH = 2560;
const SCREEN_HEIGHT = 1440;
const REGIONS = 3;
const REGION_WIDTH = Math.floor(SCREEN_WIDTH / REGIONS);  // 854 (rounded from 853.33)
const REGION_HEIGHT = SCREEN_HEIGHT;  // 1440
const DEFAULT_SLIDESHOW_INTERVAL = 10000;  // Change image every 10 seconds
const DEFAULT_FADE_DURATION = 1000;  // 1 second fade transition

// State for each region
let regions = [];
let imageCache = [[], [], []];
let currentImageIndex = [0, 0, 0];
let loadingPromises = [[], [], []];
let slideshowTimers = [null, null, null];

// User customizable properties
let slideshowInterval = DEFAULT_SLIDESHOW_INTERVAL;
let fadeDuration = DEFAULT_FADE_DURATION;
let randomizeImages = false;

// Initialize when the document is ready
window.onload = function() {
    console.log('Window loaded, initializing UI');
    initializeUI();
    loadImagesForAllRegions();
    startSlideshows();
};

// Create the UI elements
function initializeUI() {
    const container = document.createElement('div');
    container.id = 'slideshow-container';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.margin = '0';
    container.style.padding = '0';
    container.style.overflow = 'hidden';
    
    // Create three regions
    for (let i = 0; i < REGIONS; i++) {
        const region = document.createElement('div');
        region.className = 'slideshow-region';
        region.id = `region-${i+1}`;
        region.style.width = `${REGION_WIDTH}px`;
        region.style.height = `${REGION_HEIGHT}px`;
        region.style.position = 'absolute';
        region.style.top = '0';
        region.style.left = `${i * REGION_WIDTH}px`;
        region.style.overflow = 'hidden';
        region.style.backgroundColor = '#333'; // Add background color to make regions visible
        
        // Create two image containers for crossfade effect
        const imgContainer1 = createImageContainer(`img-${i+1}-1`, true);
        const imgContainer2 = createImageContainer(`img-${i+1}-2`, false);
        
        region.appendChild(imgContainer1);
        region.appendChild(imgContainer2);
        
        container.appendChild(region);
        
        // Store references to the image containers
        regions.push({
            element: region,
            imgContainers: [imgContainer1, imgContainer2],
            activeContainer: 0
        });
    }
    
    document.body.appendChild(container);
    
    // Debug message to indicate the UI has been initialized
    console.log('UI initialized with ' + REGIONS + ' regions');
    showDebugInfo('UI初始化完成');
}

// Create an image container for the slideshow
function createImageContainer(id, isActive) {
    const container = document.createElement('div');
    container.id = id;
    container.className = 'image-container';
    container.style.position = 'absolute';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.opacity = isActive ? '1' : '0';
    container.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    return container;
}

// Load images for all regions
function loadImagesForAllRegions() {
    console.log('Starting to load images for all regions');
    for (let regionIndex = 0; regionIndex < REGIONS; regionIndex++) {
        loadImagesForRegion(regionIndex + 1);
    }
}

// 支持多种可能的目录名
function tryLoadFromPaths(regionNum, callback) {
    // 尝试各种可能的路径
    const possiblePaths = [
        `assests/${regionNum}/`, // 当前拼写
        `assets/${regionNum}/`,  // 正确拼写
        `${regionNum}/`          // 直接在根目录
    ];
    
    // 记录当前尝试的路径索引
    let currentPathIndex = 0;
    
    // 尝试加载图片
    function tryNextPath() {
        if (currentPathIndex >= possiblePaths.length) {
            // 所有路径都尝试完了，仍没有找到图片
            callback([]);
            return;
        }
        
        const currentPath = possiblePaths[currentPathIndex];
        console.log(`尝试从 ${currentPath} 加载图片`);
        
        // 尝试加载当前路径的图片
        loadImagesFromPath(currentPath, (images) => {
            if (images.length > 0) {
                // 找到图片了
                callback(images);
            } else {
                // 当前路径没有图片，尝试下一个路径
                currentPathIndex++;
                tryNextPath();
            }
        });
    }
    
    // 开始尝试第一个路径
    tryNextPath();
}

// 从特定路径加载图片
function loadImagesFromPath(path, callback) {
    // 检查是否支持Wallpaper Engine的文件API
    if (typeof window.wallpaperRequestListFiles === 'function') {
        // 使用Wallpaper Engine API获取文件列表
        window.wallpaperRequestListFiles(path, (fileList) => {
            if (Array.isArray(fileList) && fileList.length > 0) {
                callback(fileList);
            } else {
                callback([]);
            }
        });
    } else {
        // 回退：使用硬编码的图片列表
        const regionNum = path.match(/\/(\d+)\//)?.[1];
        if (regionNum) {
            // 根据区域号返回不同的图片列表
            switch(regionNum) {
                case '1':
                    // 区域1的图片列表
                    callback([
                        "set031323.png", "set031321.png", "set031320.png", 
                        "set031319.png", "set031314.png", "set031311.png",
                        "set031307.png", "set031305.png", "set031303.png",
                        "set031222.png", "set031217.png", "set031216.png"
                    ]);
                    break;
                case '2':
                    // 区域2的图片列表
                    callback([
                        "har002101.png"
                    ]);
                    break;
                case '3':
                    // 区域3的图片列表
                    callback([
                        "kaz013323.png", "kaz013320.png", "kaz013316.png",
                        "kaz013314.png", "kaz013308.png", "kaz013224.png",
                        "kaz013218.png", "kaz013212.png", "kaz013206.png"
                    ]);
                    break;
                default:
                    callback([]);
            }
        } else {
            callback([]);
        }
    }
}

// Load images for a specific region
function loadImagesForRegion(regionNum) {
    const regionIndex = regionNum - 1;
    
    console.log(`加载区域 ${regionNum} 的图片`);
    showDebugInfo(`加载区域 ${regionNum} 的图片...`);
    
    // 尝试从多个可能的路径加载图片
    tryLoadFromPaths(regionNum, (imageFiles) => {
        if (imageFiles.length > 0) {
            console.log(`为区域 ${regionNum} 找到 ${imageFiles.length} 张图片`);
            showDebugInfo(`区域 ${regionNum}: 找到 ${imageFiles.length} 张图片`);
            
            // 找到了图片，处理它们
            const basePath = `assets/${regionNum}/`; // 使用正确的拼写
            processImageFiles(regionIndex, basePath, imageFiles);
        } else {
            console.log(`区域 ${regionNum} 没有找到图片`);
            showDebugInfo(`区域 ${regionNum}: 没有找到图片`);
            
            // 没有找到图片，显示占位符
            showPlaceholder(regionIndex, regionNum);
        }
    });
}

// 显示占位符
function showPlaceholder(regionIndex, regionNum) {
    console.log(`为区域 ${regionNum} 显示占位符`);
    
    // 移除所有现有的子元素
    const existingPlaceholder = regions[regionIndex].element.querySelector('.placeholder-text');
    if (existingPlaceholder) {
        existingPlaceholder.remove();
    }
    
    // 显示占位符文本
    const placeholderText = document.createElement('div');
    placeholderText.className = 'placeholder-text';
    placeholderText.textContent = `区域 ${regionNum}`;
    placeholderText.style.color = 'white';
    placeholderText.style.fontSize = '24px';
    placeholderText.style.fontFamily = 'Arial, sans-serif';
    placeholderText.style.position = 'absolute';
    placeholderText.style.top = '50%';
    placeholderText.style.left = '50%';
    placeholderText.style.transform = 'translate(-50%, -50%)';
    regions[regionIndex].element.appendChild(placeholderText);
}

// 显示调试信息
function showDebugInfo(message) {
    if (typeof window.showDebugInfo === 'function') {
        window.showDebugInfo(message);
    } else {
        console.log(`调试: ${message}`);
    }
}

// Process the image files once we have the file list
function processImageFiles(regionIndex, basePath, fileList) {
    // Filter for image files
    const imageFiles = fileList.filter(file => 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg') || 
        file.toLowerCase().endsWith('.png') ||
        file.toLowerCase().endsWith('.webp')
    );
    
    console.log(`区域 ${regionIndex + 1} 找到 ${imageFiles.length} 张图片`);
    
    // 始终随机化图片顺序
    shuffleArray(imageFiles);
    
    if (imageFiles.length === 0) {
        console.log(`区域 ${regionIndex + 1} 没有图片`);
        showPlaceholder(regionIndex, regionIndex + 1);
        return;
    }
    
    // Preload all images
    imageFiles.forEach((file, index) => {
        const fullPath = basePath + file;
        const img = new Image();
        
        console.log(`加载图片: ${fullPath}`);
        
        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                console.log(`图片已加载: ${fullPath}`);
                imageCache[regionIndex].push({
                    path: fullPath,
                    element: img,
                    aspectRatio: img.width / img.height
                });
                resolve();
            };
            img.onerror = () => {
                console.error(`加载图片失败: ${fullPath}`);
                reject(`加载图片失败: ${fullPath}`);
            };
        });
        
        loadingPromises[regionIndex].push(promise);
        img.src = fullPath;
    });
    
    // When all images for this region are loaded, display the first one
    Promise.all(loadingPromises[regionIndex])
        .then(() => {
            if (imageCache[regionIndex].length > 0) {
                console.log(`显示区域 ${regionIndex + 1} 的第一张图片`);
                displayImage(regionIndex, 0);
            }
        })
        .catch((error) => console.error(error));
}

// Fisher-Yates shuffle algorithm for randomizing arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Display an image in a region
function displayImage(regionIndex, imageIndex) {
    if (imageCache[regionIndex].length === 0) return;
    
    // Get the correct index (wrap around if needed)
    const actualIndex = imageIndex % imageCache[regionIndex].length;
    const region = regions[regionIndex];
    const imgData = imageCache[regionIndex][actualIndex];
    
    console.log(`显示区域 ${regionIndex + 1} 的图片 ${actualIndex + 1}/${imageCache[regionIndex].length}`);
    
    // Get the inactive container to prepare the next image
    const nextContainerIndex = 1 - region.activeContainer;
    const nextContainer = region.imgContainers[nextContainerIndex];
    
    // Clear the container
    nextContainer.innerHTML = '';
    
    // Create a clone of the image element
    const img = imgData.element.cloneNode(true);
    
    // Calculate the proper scaling to maintain aspect ratio
    // and fill height at 1440px
    const scale = REGION_HEIGHT / img.height;
    const scaledWidth = img.width * scale;
    
    // Apply the scaling
    img.style.height = `${REGION_HEIGHT}px`;
    img.style.width = `${scaledWidth}px`;
    img.style.objectFit = 'cover';
    img.style.objectPosition = 'center';
    
    // Add the image to the container
    nextContainer.appendChild(img);
    
    // Fade in the new container, fade out the old one
    nextContainer.style.opacity = '1';
    region.imgContainers[region.activeContainer].style.opacity = '0';
    
    // Update the active container
    region.activeContainer = nextContainerIndex;
    currentImageIndex[regionIndex] = actualIndex;
}

// Start the slideshows for all regions with random intervals
function startSlideshows() {
    const baseInterval = slideshowInterval;
    console.log(`开始所有区域的随机幻灯片放映，基础间隔: ${baseInterval}ms`);

    for (let i = 0; i < REGIONS; i++) {
        // Clear any existing timers for this region before starting
        if (slideshowTimers[i]) {
            clearTimeout(slideshowTimers[i]);
            slideshowTimers[i] = null;
        }
        // Start the scheduling loop for each region
        scheduleNextImage(i);
    }
}

// Schedule the next image display for a specific region
function scheduleNextImage(regionIndex) {
    if (imageCache[regionIndex].length <= 1) {
        // Don't schedule if there's only one or zero images
        console.log(`区域 ${regionIndex + 1} 图片数量不足，不进行定时切换`);
        return;
    }

    // Calculate a random interval (e.g., 75% to 125% of the base interval)
    const randomInterval = slideshowInterval * (0.75 + Math.random() * 0.5);
    console.log(`区域 ${regionIndex + 1} 下次切换时间: ${Math.round(randomInterval)}ms`);

    // Clear previous timer just in case (safety measure)
    if (slideshowTimers[regionIndex]) {
        clearTimeout(slideshowTimers[regionIndex]);
    }

    slideshowTimers[regionIndex] = setTimeout(() => {
        // Display the next image
        displayImage(regionIndex, currentImageIndex[regionIndex] + 1);
        // Schedule the *next* display
        scheduleNextImage(regionIndex);
    }, randomInterval);
}

// Restart all slideshows with new settings
function restartSlideshows() {
    console.log('使用新设置重启幻灯片放映');

    // Stop all existing timers
    for (let i = 0; i < REGIONS; i++) {
        if (slideshowTimers[i]) {
            clearTimeout(slideshowTimers[i]); // Use clearTimeout
            slideshowTimers[i] = null;
        }
    }

    // Update transition duration for all containers
    document.querySelectorAll('.image-container').forEach(container => {
        container.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
    });

    // Restart slideshows (which will now use random intervals)
    startSlideshows();
}

// Reload images with randomization if needed
function reloadImages() {
    console.log('重新加载所有图片');
    
    // Clear existing image cache
    imageCache = [[], [], []];
    loadingPromises = [[], [], []];
    currentImageIndex = [0, 0, 0];
    
    // Reload all images
    loadImagesForAllRegions();
}

// Wallpaper Engine property listener
window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        let needsRestart = false;
        let needsReload = false;
        
        // Slideshow interval
        if (properties.slideshowInterval) {
            const value = properties.slideshowInterval.value;
            slideshowInterval = value * 1000; // Convert to milliseconds
            console.log('更新幻灯片间隔为: ' + slideshowInterval + 'ms');
            needsRestart = true;
        }
        
        // Fade duration
        if (properties.fadeDuration) {
            const value = properties.fadeDuration.value;
            fadeDuration = value * 1000; // Convert to milliseconds
            console.log('更新淡入淡出持续时间为: ' + fadeDuration + 'ms');
            needsRestart = true;
        }
        
        // Randomize images
        if (properties.randomize !== undefined) {
            const newValue = properties.randomize.value;
            if (randomizeImages !== newValue) {
                randomizeImages = newValue;
                console.log('更新随机图片为: ' + randomizeImages);
                needsReload = true;
            }
        }
        
        // Apply changes if needed
        if (needsReload) {
            reloadImages();
        } else if (needsRestart) {
            restartSlideshows();
        }
    }
}; 