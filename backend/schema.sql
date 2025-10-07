CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    cuisine VARCHAR(255),
    title VARCHAR(500),
    rating REAL,
    prep_time INT,
    cook_time INT,
    total_time INT,
    description TEXT,
    nutrients JSONB,
    calories_int INT,
    serves VARCHAR(100),
    created_at TIMESTAMP DEFAULT now()
);


CREATE INDEX idx_recipes_rating ON recipes (rating DESC);
CREATE INDEX idx_recipes_calories ON recipes (calories_int);
CREATE INDEX idx_recipes_title ON recipes USING gin (to_tsvector('english', title));
CREATE INDEX idx_recipes_cuisine ON recipes (cuisine);
