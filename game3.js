var CANVAS_WIDTH  = 350;
var CANVAS_HEIGHT = 450;

var GRID_WIDTH  = 300;
var GRID_HEIGHT = 450;

var GRID_NUM_HORIZ = GRID_NUM_VERT = 4;
var RECT_WIDTH     = GRID_WIDTH / GRID_NUM_HORIZ;
var RECT_HEIGHT    = GRID_HEIGHT / GRID_NUM_VERT;

var HIGHEST_COLOR = "#F00",
    BLACK_COLOR   = "#000",
    WHITE_COLOR   = "#FFF",
    GREY_COLOR    = "#CCC";

// default background is white
var back_color = BLACK_COLOR;

// defaults are one = blue, two = red, three = white
var one_color     = "#39F",
    two_color     = "#F99",
    three_color   = WHITE_COLOR;  

// default black
var tile_stroke_color = BLACK_COLOR;
var tile_text_color   = WHITE_COLOR;

var KEY_LEFT  = 37,
    KEY_UP    = 38,
    KEY_RIGHT = 39,
    KEY_DOWN  = 40;

var num_colors_list = new Array(3);
num_colors_list[0] = one_color;
num_colors_list[1] = two_color;
num_colors_list[2] = three_color;

back_color        = BLACK_COLOR;
tile_stroke_color = GREY_COLOR;
tile_text_color   = WHITE_COLOR;

var can_move = {
    left: true,
    up: true,
    right: true,
    down: true
};

var graphics_choice = 1;

var nums_grid = new Array(4);

var stage;

var next_val;

//max value starts at 6
var max_val = 5;

var MAX_TEXT_COLOR = two_color;

var next_tile;

function tile(value, x_pos, y_pos, x, y, color) {
    this.num_val = value;

    this.x_pos = x_pos;
    this.y_pos = y_pos;

    this.x = x;
    this.y = y;

    this.color = color;

    this.tile_shape = new createjs.Shape();
    this.tile_shape.x = this.x;
    this.tile_shape.y = this.y;
    this.tile_shape.graphics.setStrokeStyle(2,"round").beginStroke(tile_stroke_color).beginFill(this.color)
        .drawRoundRect(x,y,RECT_WIDTH,RECT_HEIGHT,20);

    this.value_text = new createjs.Text(value,"bold 16px Lucida Console",
        get_value_text_color(this.num_val));
    this.value_text.x = this.x + this.x_pos * RECT_WIDTH/2 + RECT_WIDTH/2 + get_tile_text_x(this.num_val);
    this.value_text.y = this.y + this.y_pos * RECT_HEIGHT/2 + RECT_HEIGHT/2 - 20;

    this.get_children = function() {
        return [this.tile_shape,this.value_text];
    }

    this.update_pos = function(new_val, new_x_pos, new_y_pos, new_x, new_y, new_color) {
        
        var children_to_remove;
        if (nums_grid[new_y_pos][new_x_pos] !== undefined) {
            children_to_remove = nums_grid[new_y_pos][new_x_pos].get_children();
            for (var i = 0; i < children_to_remove.length; i++) {
                get_stage().removeChild(children_to_remove[i]);
            }
        }

        children_to_remove = nums_grid[this.y_pos][this.x_pos].get_children();
        for (var i = 0; i < children_to_remove.length; i++) {
            get_stage().removeChild(children_to_remove[i]);
        }

        nums_grid[new_y_pos][new_x_pos] = new tile(new_val, new_x_pos, new_y_pos,
            new_x, new_y, new_color);

        delete nums_grid[this.y_pos][this.x_pos];

        var children_to_add = nums_grid[new_y_pos][new_x_pos].get_children();
        for (var i = 0; i < children_to_add.length; i++) {
            get_stage().addChild(children_to_add[i]);
        }

        get_stage().update();
    }

    this.move_left = function() {
        this.update_pos(this.num_val, this.x_pos-1, this.y_pos,
            this.tile_shape.x - RECT_WIDTH/2, this.tile_shape.y, this.color);
    }

    this.move_up = function() {
        this.update_pos(this.num_val, this.x_pos, this.y_pos-1,
            this.tile_shape.x, this.tile_shape.y - RECT_HEIGHT/2, this.color);
    }

    this.move_right = function() {
        this.update_pos(this.num_val, this.x_pos+1, this.y_pos,
            this.tile_shape.x + RECT_WIDTH/2, this.tile_shape.y, this.color);
    }

    this.move_down = function() {
        this.update_pos(this.num_val, this.x_pos, this.y_pos+1,
            this.tile_shape.x, this.tile_shape.y + RECT_HEIGHT/2, this.color);
    }
}

function get_value_text_color(val) {
    if (val === 1 || val === 2) {
        return WHITE_COLOR;
    } else if (val === max_val) {
        return MAX_TEXT_COLOR;
    } else if (val > max_val) {
        update_all_tiles_with_max();
        max_val = val;
        return MAX_TEXT_COLOR;
    } else {
        return BLACK_COLOR;
    }
}

function get_tile_text_x(val) {
    if (val < 10) {
        return -5;
    } else if (val < 100) {
        return -10;
    } else if (val < 1000) {
        return -15;
    } else if (val < 10000) {
        return -20;
    }
}

function update_all_tiles_with_max() {
    for (var y_pos = 0; y_pos < 4; y_pos++) {
        for (var x_pos = 0; x_pos < 4; x_pos++) {
            if (nums_grid[y_pos][x_pos]) {
                if (nums_grid[y_pos][x_pos].num_val === max_val) {
                    nums_grid[y_pos][x_pos].value_text.color = BLACK_COLOR;
                }
            }
        }
    }
}

function combine_tiles(start_tile, end_tile) {
    // the start_tile tries to combine with end_tile, this will only happen if possible.
    // start_tile will be destroyed while end_tile will be the result of the combination, 
    // both within the grid and in terms of value
    if (start_tile.num_val === 1) {
        if (end_tile.num_val === 2) {
            start_tile.update_pos(3, end_tile.x_pos, end_tile.y_pos, end_tile.x, end_tile.y, num_colors_list[2]);
            return true;
        }
    } else if (start_tile.num_val === 2) {
        if (end_tile.num_val === 1) {
            start_tile.update_pos(3, end_tile.x_pos, end_tile.y_pos, end_tile.x, end_tile.y, num_colors_list[2]);
            return true;
        }
    } else if (start_tile.num_val % 3 === 0) {
        if ( start_tile.num_val === end_tile.num_val) {
            start_tile.update_pos(start_tile.num_val + end_tile.num_val, end_tile.x_pos, end_tile.y_pos,
                end_tile.x, end_tile.y, num_colors_list[2]);
            return true;
        }    
    }
    return false;
}

function keyPressed(event) {
    var valid_places = new Array();
    var can_move = false;
    switch(event.keyCode) {
        case KEY_LEFT:
            for (var y_pos = 0; y_pos < 4; y_pos++) {
                for (var x_pos = 1; x_pos < 4; x_pos++) {
                    if (nums_grid[y_pos][x_pos]) {
                        if (!nums_grid[y_pos][x_pos-1]) {
                            nums_grid[y_pos][x_pos].move_left();
                            can_move = true;
                        } else {
                            can_move = combine_tiles(nums_grid[y_pos][x_pos], nums_grid[y_pos][x_pos-1]);
                        }
                    }
                }
                if (!nums_grid[y_pos][3] && can_move) {
                    valid_places.push(y_pos);
                }
            }
            if (valid_places.length > 0) {
                var rand_place = Math.floor(Math.random()*valid_places.length);
                var new_rand_tile = new tile(next_val, 3, valid_places[rand_place],
                    3 * RECT_WIDTH/2, valid_places[rand_place] * RECT_HEIGHT/2, num_colors_list[next_val-1]);

                nums_grid[valid_places[rand_place]][3] = new_rand_tile;
                var children_to_add = nums_grid[valid_places[rand_place]][3].get_children();
                for (var i = 0; i < children_to_add.length; i++) { get_stage().addChild(children_to_add[i]); }
                get_stage().update();
                set_next_val();
                get_stage().removeChild(next_tile);
                draw_next_tile();
            }
            break;
        case KEY_UP:
            for (var x_pos = 0; x_pos < 4; x_pos++) {
                for (var y_pos = 1; y_pos < 4; y_pos++) {
                    if (nums_grid[y_pos][x_pos]) {
                        if (!nums_grid[y_pos-1][x_pos]) {
                            nums_grid[y_pos][x_pos].move_up();
                            can_move = true;
                        } else {
                            can_move = combine_tiles(nums_grid[y_pos][x_pos], nums_grid[y_pos-1][x_pos]);
                        }
                    }
                }
                if (!nums_grid[3][x_pos] && can_move) {
                    valid_places.push(x_pos);
                }
            }
            if (valid_places.length > 0) {
                var rand_place = Math.floor(Math.random()*valid_places.length);
                var new_rand_tile = new tile(next_val, valid_places[rand_place], 3,
                    valid_places[rand_place] * RECT_WIDTH/2, 3 * RECT_HEIGHT/2, num_colors_list[next_val-1]);

                nums_grid[3][valid_places[rand_place]] = new_rand_tile;
                var children_to_add = nums_grid[3][valid_places[rand_place]].get_children();
                for (var i = 0; i < children_to_add.length; i++) { get_stage().addChild(children_to_add[i]); }
                get_stage().update();
                set_next_val();
                get_stage().removeChild(next_tile);
                draw_next_tile();
            }
            break;
        case KEY_RIGHT:
            for (var y_pos = 0; y_pos < 4; y_pos++) {
                for (var x_pos = 2; x_pos >= 0; x_pos--) {
                    if (nums_grid[y_pos][x_pos]) {
                        if (!nums_grid[y_pos][x_pos+1]) {
                            nums_grid[y_pos][x_pos].move_right();
                            can_move = true;
                        } else {
                            can_move = combine_tiles(nums_grid[y_pos][x_pos], nums_grid[y_pos][x_pos+1]);
                        }
                    }
                }
                if (!nums_grid[y_pos][0] && can_move) {
                    valid_places.push(y_pos);
                }
            }
            if (valid_places.length > 0) {
                var rand_place = Math.floor(Math.random()*valid_places.length);
                var new_rand_tile = new tile(next_val, 0, valid_places[rand_place],
                    0, valid_places[rand_place] * RECT_HEIGHT/2, num_colors_list[next_val-1]);

                nums_grid[valid_places[rand_place]][0] = new_rand_tile;
                var children_to_add = nums_grid[valid_places[rand_place]][0].get_children();
                for (var i = 0; i < children_to_add.length; i++) { get_stage().addChild(children_to_add[i]); }
                get_stage().update();
                set_next_val();
                get_stage().removeChild(next_tile);
                draw_next_tile();
            } 
            break;
        case KEY_DOWN:
            for (var x_pos = 0; x_pos < 4; x_pos++) {
                for (var y_pos = 2; y_pos >= 0; y_pos--) {
                    if (nums_grid[y_pos][x_pos]) {
                        if (!nums_grid[y_pos+1][x_pos]) {
                            nums_grid[y_pos][x_pos].move_down();
                            can_move = true;                            
                        } else {
                            can_move = combine_tiles(nums_grid[y_pos][x_pos], nums_grid[y_pos+1][x_pos]);
                        }
                    }
                }
                if (!nums_grid[0][x_pos] && can_move) {
                    valid_places.push(x_pos);
                }
            }
            if (valid_places.length > 0) {
                var rand_place = Math.floor(Math.random()*valid_places.length);
                var new_rand_tile = new tile(next_val, valid_places[rand_place], 0,
                    valid_places[rand_place] * RECT_WIDTH/2, 0, num_colors_list[next_val-1]);

                nums_grid[0][valid_places[rand_place]] = new_rand_tile;
                var children_to_add = nums_grid[0][valid_places[rand_place]].get_children();
                for (var i = 0; i < children_to_add.length; i++) { get_stage().addChild(children_to_add[i]); }
                get_stage().update();
                set_next_val();
                get_stage().removeChild(next_tile);
                draw_next_tile();
            }
            break;
    }
    if (event.keyCode === KEY_LEFT || event.keyCode === KEY_UP || event.keyCode === KEY_RIGHT || event.keyCode === KEY_DOWN) {
        if (valid_places.length === 0) {
            if (check_game_over()) {
                game_over();
            }
        }
    }
}

function check_game_over() {
    for (var y_pos = 0; y_pos < 4; y_pos++) {
        for (var x_pos = 0; x_pos < 4; x_pos++) {
            if (!nums_grid[y_pos][x_pos]) {
                return false;
            } else {
                if (y_pos > 0) {
                    if (nums_grid[y_pos-1][x_pos]) {
                        if (nums_grid[y_pos][x_pos].num_val === 1 && nums_grid[y_pos-1][x_pos].num_val === 2) {
                            return false;
                        } else if (nums_grid[y_pos][x_pos].num_val === 2 && nums_grid[y_pos-1][x_pos].num_val === 1) {
                            return false;
                        } else if (nums_grid[y_pos][x_pos].num_val % 3 === 0 && nums_grid[y_pos-1][x_pos].num_val % 3 === 0) {
                            if (nums_grid[y_pos][x_pos].num_val === nums_grid[y_pos-1][x_pos].num_val ) {
                                return false;
                            }
                        }
                    }
                }
                if (x_pos > 0) {
                    if (nums_grid[y_pos][x_pos-1]) {
                        if (nums_grid[y_pos][x_pos].num_val === 1 && nums_grid[y_pos][x_pos-1].num_val === 2) {
                            return false;
                        } else if (nums_grid[y_pos][x_pos].num_val === 2 && nums_grid[y_pos][x_pos-1].num_val === 1) {
                            return false;
                        } else if (nums_grid[y_pos][x_pos].num_val % 3 === 0 && nums_grid[y_pos][x_pos-1].num_val % 3 === 0) {
                            if (nums_grid[y_pos][x_pos].num_val === nums_grid[y_pos][x_pos-1].num_val ) {
                                return false;
                            }
                        }
                    }
                }
                if (y_pos < 3) {
                    if (nums_grid[y_pos+1][x_pos]) {
                        if (nums_grid[y_pos][x_pos].num_val === 1 && nums_grid[y_pos+1][x_pos].num_val === 2) {
                            return false;
                        } else if (nums_grid[y_pos][x_pos].num_val === 2 && nums_grid[y_pos+1][x_pos].num_val === 1) {
                            return false;
                        } else if (nums_grid[y_pos][x_pos].num_val % 3 === 0 && nums_grid[y_pos+1][x_pos].num_val % 3 === 0) {
                            if (nums_grid[y_pos][x_pos].num_val === nums_grid[y_pos+1][x_pos].num_val ) {
                                return false;
                            }
                        }
                    }
                }
                if (x_pos < 3) {
                    if (nums_grid[y_pos][x_pos+1]) {
                        if (nums_grid[y_pos][x_pos].num_val === 1 && nums_grid[y_pos][x_pos+1].num_val === 2) {
                            return false;
                        } else if (nums_grid[y_pos][x_pos].num_val === 2 && nums_grid[y_pos][x_pos+1].num_val === 1) {
                            return false;
                        } else if (nums_grid[y_pos][x_pos].num_val % 3 === 0 && nums_grid[y_pos][x_pos+1].num_val % 3 === 0) {
                            if (nums_grid[y_pos][x_pos].num_val === nums_grid[y_pos][x_pos+1].num_val ) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }
    return true;
}

function game_over() {
    get_stage().removeAllChildren();

    var score = 0;
    for (var y_pos = 0; y_pos < 4; y_pos++) {
        for (var x_pos = 0; x_pos < 4; x_pos++) {
            if (nums_grid[y_pos][x_pos]) {
                if (nums_grid[y_pos][x_pos].num_val % 3 === 0) {
                    for (var i = 0; i < 11; i++) {
                        if (Math.pow(2,i)*3 === nums_grid[y_pos][x_pos].num_val) {
                            score += Math.pow(3,i+1);
                        }
                    }
                }
            }
        }
    }

    var game_over_text = new createjs.Text("Game Over","bold 20px Lucida Console",BLACK_COLOR);
    game_over_text.textAlign = "center";
    game_over_text.x = 175;
    game_over_text.y = RECT_HEIGHT * 0.75;
    
    var score_text = new createjs.Text("Score: " + score, "bold 20px Lucida Console", BLACK_COLOR);
    score_text.textAlign = "center";
    score_text.x = 175;
    score_text.y = RECT_HEIGHT * 1.1;

    var restart_button = new createjs.Container();
    restart_button.x = 100;
    restart_button.y = RECT_HEIGHT * 1.5;

    var restart_button_shape = new createjs.Shape();
    restart_button_shape.graphics.setStrokeStyle(2,"square").beginStroke(BLACK_COLOR).beginFill(WHITE_COLOR)
        .drawRoundRect(0,0,RECT_WIDTH*2,RECT_HEIGHT/2,20);
    var restart_button_text = new createjs.Text("Restart","bold 20px Lucida Console",BLACK_COLOR);
    restart_button_text.x = RECT_WIDTH;
    restart_button_text.y = RECT_HEIGHT/6;
    restart_button_text.textAlign = "center";

    restart_button.addChild(restart_button_shape, restart_button_text);
    restart_button.addEventListener("click", function(event) {
            get_stage().removeAllChildren();
            start_game();
        }
    );

    get_stage().addChild(game_over_text);
    get_stage().addChild(score_text);
    get_stage().addChild(restart_button);
    get_stage().update();
}

function set_next_val() {
    next_val = Math.floor((Math.random()*3)+1);
}

function init() {
    set_stage(new createjs.Stage("canvas"));
    
    setup_start_screen();
}

function set_stage(stage_to_set) {
    stage = stage_to_set;
}

function get_stage() {
    return stage;
}

function setup_graphics(choice) {
    if (choice === 1) {
        one_color         = "#39F";
        two_color         = "#F99";
        three_color       = WHITE_COLOR;
        back_color        = WHITE_COLOR;
        tile_stroke_color = BLACK_COLOR;
        tile_text_color   = BLACK_COLOR;
    } else if (choice === 2) {
        one_color         = "#39F";
        two_color         = "#F99";
        three_color       = BLACK_COLOR;
        back_color        = BLACK_COLOR;
        tile_stroke_color = WHITE_COLOR;
        tile_text_color   = WHITE_COLOR;
    }
    num_colors_list[0] = one_color;
    num_colors_list[1] = two_color;
    num_colors_list[2] = three_color;
}

function setup_start_screen() {
    var title_text = new createjs.Text("3 Game","bold 20px Lucida Console",BLACK_COLOR);
    title_text.textAlign = "center";
    title_text.x = 175;
    title_text.y = RECT_HEIGHT * 0.75;

    var start_button = new createjs.Container();
    start_button.x = 100;
    start_button.y = RECT_HEIGHT * 1.5;

    var start_button_shape = new createjs.Shape();
    start_button_shape.graphics.setStrokeStyle(2,"square").beginStroke(BLACK_COLOR).beginFill(WHITE_COLOR)
        .drawRoundRect(0,0,RECT_WIDTH*2,RECT_HEIGHT/2,20);
    var start_button_text = new createjs.Text("Start","bold 20px Lucida Console",BLACK_COLOR);
    start_button_text.x = RECT_WIDTH;
    start_button_text.y = RECT_HEIGHT/6;
    start_button_text.textAlign = "center";
    
    start_button.addChild(start_button_shape, start_button_text);
    start_button.addEventListener("click", function(event) {
            get_stage().removeAllChildren();
            start_game();
        }
    );

    get_stage().addChild(title_text);
    get_stage().addChild(start_button);
    get_stage().update();
}

function start_game() {
    var back_rect = new createjs.Shape();
    back_rect.graphics.beginFill(BLACK_COLOR).drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
    get_stage().addChild(back_rect);
    get_stage().update();

    var grid = [];

    set_next_val();
    draw_next_tile();
    // draw_help_tile();

    for (var i = 0; i < GRID_NUM_VERT; i++) {
        var grid_row = [];
        for (var j = 0; j < GRID_NUM_HORIZ; j++) {
            var new_grid_rect = new createjs.Shape();
            new_grid_rect.x = j*RECT_WIDTH/2;
            new_grid_rect.y = i*RECT_HEIGHT/2;
            new_grid_rect.graphics.setStrokeStyle(2,"square").beginStroke(GREY_COLOR).beginFill(back_color)
                .drawRect(new_grid_rect.x,new_grid_rect.y,RECT_WIDTH,RECT_HEIGHT);
            grid_row.push(new_grid_rect);
        }
        grid.push(grid_row);
    }
    for (var i = 0; i < GRID_NUM_VERT; i++) {
        for (var j = 0; j < GRID_NUM_HORIZ; j++) {
            get_stage().addChild(grid[i][j]);
        }
    }
    
    get_stage().update();

    var start_nums = get_start_nums();

    for (var i = 0; i < 4; i++) { nums_grid[i] = new Array(4) }

    draw_start_nums(nums_grid, start_nums);

    this.document.onkeydown = keyPressed;

    get_stage().update();
}

function draw_next_tile() {
    next_tile = new createjs.Shape();
    next_tile.x = 154;
    next_tile.y = 12;
    get_stage().removeChild(next_tile);
    next_tile.graphics.setStrokeStyle(2,"round").beginStroke(GREY_COLOR).beginFill(num_colors_list[next_val-1])
        .drawRoundRect(next_tile.x,next_tile.y,RECT_WIDTH/2,RECT_HEIGHT/2,15);
    get_stage().addChild(next_tile);
    get_stage().update();
}

function draw_help_tile() {
    var help_tile = new createjs.Container();
    help_tile.x = 308;
    help_tile.y = 365;

    var help_tile_shape = new createjs.Shape();
    help_tile_shape.graphics.setStrokeStyle(2,"round").beginStroke(GREY_COLOR).beginFill(WHITE_COLOR)
        .drawRoundRect(0,0,RECT_WIDTH/2,RECT_HEIGHT/2,15);

    var help_tile_text = new createjs.Text("?","bold 20px Lucida Console", BLACK_COLOR);
    help_tile_text.x = RECT_WIDTH/4;
    help_tile_text.y = RECT_HEIGHT/7;
    help_tile_text.textAlign = "center";

    help_tile.addChild(help_tile_shape, help_tile_text);
    help_tile.addEventListener("click", function(event) {
        display_help();
    });

    get_stage().addChild(help_tile);
    get_stage().update();
}

function display_help() {
    console.log("help");
}

function get_start_nums() {
    var start_max = 9;
    var first_num = Math.floor((Math.random()*3)+2);
    start_max -= first_num;
    var second_num = 0;
    if (first_num === 2) {
        second_num = Math.floor((Math.random()*2)+3);
    } else if (first_num === 3) {
        second_num = Math.floor((Math.random()*3)+2);
    } else if (first_num === 4) {
        second_num = Math.floor((Math.random()*2)+2);
    }
    start_max -= second_num;
    third_num = start_max;
    return [first_num,second_num,third_num];
}

function draw_start_nums(nums_grid, start_nums) {
    var start_max = 9;

    var val = 0;
    var num = start_nums[val];
    for (var start_max = 8; start_max >= 0; start_max--) {
        var rand_pos = Math.floor(Math.random()*16);
        var x_pos = rand_pos % 4;
        var y_pos = Math.floor(rand_pos/4);
        if (nums_grid[y_pos][x_pos] === undefined) {
            var x = x_pos * RECT_WIDTH/2;
            var y = y_pos * RECT_HEIGHT/2;
            var new_num_tile = new tile(val + 1, x_pos, y_pos, x, y, num_colors_list[val]);

            nums_grid[y_pos][x_pos] = new_num_tile;
            var children_to_add = nums_grid[y_pos][x_pos].get_children();
            for (var i = 0; i < children_to_add.length; i++) { get_stage().addChild(children_to_add[i]); }
            if (num == 1) {
                val++;
                num = start_nums[val];
            } else {
                num--;
            }
        } else {
            start_max++;
        }
    }
}