-- 026: Create missing tables (post_categories, sliders, slides)
-- These tables are referenced by routes but were never created in migrations

-- Junction table for many-to-many posts <-> categories
CREATE TABLE IF NOT EXISTS post_categories (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Sliders
CREATE TABLE IF NOT EXISTS sliders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    location VARCHAR(100) DEFAULT 'home_hero',
    settings JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Slides (belong to sliders)
CREATE TABLE IF NOT EXISTS slides (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slider_id INT NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    content TEXT,
    image VARCHAR(500),
    video_url VARCHAR(500),
    button_text VARCHAR(100),
    button_url VARCHAR(500),
    button_target VARCHAR(20) DEFAULT '_self',
    overlay_color VARCHAR(20),
    overlay_opacity DECIMAL(3,2) DEFAULT 0.50,
    text_position VARCHAR(20) DEFAULT 'center',
    animation VARCHAR(50) DEFAULT 'fade',
    sort_order INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (slider_id) REFERENCES sliders(id) ON DELETE CASCADE
);
