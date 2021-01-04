import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-position-calculator',
  templateUrl: './position-calculator.component.html',
  styleUrls: ['./position-calculator.component.css']
})
export class PositionCalculatorComponent implements OnInit {

    scale: string;  // Ratings scale; '20 to 80', '1 to 5', etc.
    feet: number;  
    inches: number; 
    errorIn: boolean;  // Error in inches
    centimeters: number;
    errorCm: boolean;  // Error in centimeters
    useCm: boolean;  // Whether or not centimeters are used
    useIn: boolean;  // Whether or not inches are used
    lefty: boolean;  // Whether or not the player throws left
    skills: number[];  // Defensive skills
    errorRange: boolean;  // Outside of range
    errorInterval: boolean;  // Not a multiple of 5 (20-80)
    errorGroup: boolean;
    errorCatcher: boolean;  // Need 1 full group
    errorInfield: boolean;
    errorOutfield: boolean; 
    positions: string[];  // List of positions
    ratings: string[];  // Ratings corresponding with positions
    colors: string[];  // Colors corresponding with ratings
    wars: string[];  // WAR values corresponding with ratings

    constructor(private cookieService: CookieService) { 
        this.useIn = true;
        this.lefty = false;
        this.errorIn = false;
        this.errorCm = false;
        this.skills = [null, null, null, null, null, null, null, null, null];
        this.errorRange = false;
        this.errorInterval = false;
        this.errorGroup = false;
        this.errorCatcher = false;
        this.errorInfield = false;
        this.errorOutfield = false;
        this.positions = ["Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field"];
        this.ratings = ["-", "-", "-", "-", "-", "-", "-", "-"];
        this.colors = ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"];
        this.wars = ["-", "-", "-", "-", "-", "-", "-", "-"];
    }

    ngOnInit(): void {
        var scale = this.cookieService.get("scale");
        if (scale == "") {
            this.scale = "20 to 80";
        } else {
            this.scale = scale;
        }
        var units = this.cookieService.get("units");
        if (units == "cm") {
            this.useCm = true;
            this.useIn = false;
        } else {
            this.useCm = false;
            this.useIn = true;
        }
    }

    changeScale(): void {
        this.cookieService.set("scale", this.scale, 32767);
    }

    changeUnits(): void {
        this.useCm = !this.useCm;
        this.useIn = !this.useIn;

        if (this.useCm) {
            this.cookieService.set("units", "cm", 32767);
        } else {
            this.cookieService.set("units", "in", 32767);
        }

        if (this.useCm && this.inches != null && this.feet != null) {
            this.centimeters = Math.round(2.54 * (12 * this.feet + this.inches));
        } else if (this.centimeters != null) {
            var inches = Math.round(this.centimeters / 2.54);
            this.feet = Math.floor(inches / 12);
            this.inches = inches % 12;
        } else {
            this.inches = null;
            this.feet = null;
            this.centimeters = null;
        }

        this.errorCm = false;
        this.errorIn = false;
    }

    onSubmit(event: Event): void {
        event.preventDefault();
        var valid = this.validate();
        if (valid) {
            this.calculatePositions();
        }
    }

    onClear(event : Event): void {
        event.preventDefault();
        this.feet = null;
        this.inches = null;
        this.centimeters = null;
        this.lefty = false;
        this.errorIn = false;
        this.errorCm = false;
        this.skills = [null, null, null, null, null, null, null, null, null];
        this.errorRange = false;
        this.errorInterval = false;
        this.errorGroup = false;
        this.errorCatcher = false;
        this.errorInfield = false;
        this.errorOutfield = false;
        this.positions = ["Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field"];
        this.ratings = ["-", "-", "-", "-", "-", "-", "-", "-"];
        this.colors = ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"];
        this.wars = ["-", "-", "-", "-", "-", "-", "-", "-"];
    }

    validate(): boolean {
        // Validate height
        if (this.useIn) {
            if (this.feet < 0 || this.feet > 11 || this.inches < 0 || this.inches > 11) {
                this.errorIn = true;
            } else {
                this.errorIn = false;
            }
        } else if (this.centimeters < 0) {
            this.errorCm = true;
        } else {
            this.errorCm = false;
        }
        // Validate range & intervals
        var skill;
        var split = this.scale.split(" ");
        var min = Number(split[0]);
        var max = Number(split[2]);
        var converted;
        var half;

        if (min == 20) {
            half = 2.5;
        } else {
            half = 0.5;
        }

        this.errorRange = false;
        this.errorInterval = false;

        for (var i = 0; i < this.skills.length; ++i) {
            skill = this.skills[i];
            if (skill != null) {
                converted = (skill - min - half - 1) * (200 / (max - min));
                if (skill < min || converted > 250) {
                    this.errorRange = true;
                    break;
                } else if (this.scale == "20 to 80" && (skill % 5 != 0)) {
                    this.errorInterval = true;
                    break;
                } 
            }
        }

        this.errorCatcher = true;
        this.errorInfield = true;
        this.errorOutfield = true;

        if (this.skills[0] != null && this.skills[1] != null) {
            this.errorCatcher = false;
        } 
        
        if (this.skills[2] != null && this.skills[3] != null && this.skills[4] != null && this.skills[5] != null) {
            this.errorInfield = false;
        } 
        
        if (this.skills[6] != null && this.skills[7] != null && this.skills[8] != null) {
            this.errorOutfield = false;
        }

        if (!this.errorRange && !this.errorInterval && (this.errorCatcher && this.errorInfield && this.errorOutfield)) {
            this.errorGroup = true;
        } else {
            this.errorGroup = false;
        }

        return !(this.errorCm || this.errorIn || this.errorRange || this.errorInterval || this.errorGroup);
    }

    calculatePositions(): void {
        // Initialize
        this.ratings = ["-", "-", "-", "-", "-", "-", "-", "-"];
        this.colors = ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"];
        this.wars = ["-", "-", "-", "-", "-", "-", "-", "-"];

        // Get scale max/min
        var split = this.scale.split(" ");
        var min = Number(split[0]);
        var max = Number(split[2]);

        // Convert to 1-250
        var half;
        if (min == 20) {
            half = 5 / 2;
        } else {
            half = 1 / 2;
        }

        var converted: number[] = [null, null, null, null, null, null, null, null, null];
        var grade;
        var num;
        for (var i = 0; i < converted.length; ++i) {
            if (this.skills[i] == null) {
                continue;
            }
            grade = this.skills[i];
            num = Math.ceil(((grade + half) - min) * 200 / (max - min) - 1);
            if (num > 250) {
                converted[i] = 250;
            } else {
                converted[i] = num;
            }
        }

        var ratings = [0, 0, 0, 0, 0, 0, 0, 0];
        var abil;
        var arm;
        var range;
        var error;
        var turn;

        // Calculate positional value, shoutout to u/bvimarlins
        // Calculate catcher
        if (!this.errorCatcher) {
            abil = (converted[0] - 125) / 25 * 19.5;
            arm = (converted[1] - 125) / 25 * 19.5;
            ratings[0] = abil + arm + 133;
        }

        // Calculate 1B
        var height;
        if (this.useIn) {
            height = Math.round(30.48 * this.feet + 2.54 * this.inches);
        } else {
            height = this.centimeters;
        }

        if (height > 0 && !this.errorInfield) {
            if (height > 215) {
                height = 215;
            }
            range;
            error;
            if (converted[2] < 90) {
                range = converted[2] / 3;
            } else {
                range = 30 + (converted[2] - 90) * 2 / 25;
            }

            if (converted[3] < 90) {
                error = converted[3] / 5;
            } else {
                error = 18 + (converted[3] - 90) / 25;
            }
            arm = converted[4] / 70;
            turn = converted[5] / 70;
            var hfac = 1 + (height - 155) / 15;
            ratings[1] = hfac * (range + error + arm + turn);
        }

        // Calculate rest of IF
        if (!this.errorInfield && !this.lefty) {
            range = (converted[2] - 125) / 25 * 21.5;
            error = (converted[3] - 125) / 25 * 8.25;
            arm = (converted[4] - 125) / 25 * 1.5;
            turn = (converted[5] - 125) / 25 * 9;
            ratings[2] = range + error + arm + turn + 129;
            range = (converted[2] - 125) / 25 * 13;
            error = (converted[3] - 125) / 25 * 7.5;
            arm = (converted[4] - 125) / 25 * 17;
            turn = (converted[5] - 125) / 25 * 3.25;
            ratings[3] = range + error + arm + turn + 113.5;
            range = (converted[2] - 125) / 25 * 25.5;
            error = (converted[3] - 125) / 25 * 7.5;
            arm = (converted[4] - 125) / 25 * 2;
            turn = (converted[5] - 125) / 25 * 8;
            ratings[4] = range + error + arm + turn + 93.75;
        }

        // Calculate OF
        if (!this.errorOutfield) {
            range = (converted[6] - 125) / 25 * 29.5;
            error = (converted[7] - 125) / 25 * 4;
            arm = (converted[8] - 125) / 25 * 5.75;
            ratings[5] = range + error + arm + 149;
            range = (converted[6] - 125) / 25 * 43;
            error = (converted[7] - 125) / 25 * 3.5;
            arm = (converted[8] - 125) / 25 * 1.75;
            ratings[6] = range + error + arm + 78;
            range = (converted[6] - 125) / 25 * 25.5;
            error = (converted[7] - 125) / 25 * 4;
            arm = (converted[8] - 125) / 25 * 11;
            ratings[7] = range + error + arm + 129;
        }

        // Convert back, get colors and WARs
        var slopes = [0.003, 0.009, 0.018, 0.015, 0.024, 0.009, 0.015, 0.009];
        var intercepts = [1.1, -1.75, -1.5, -1.05, -1.8, -1.3, -1.15, -1.25];
        var rating;
        var grade;
        var war;
        for (var i = 0; i < ratings.length; ++i) {
            rating = ratings[i];
            grade = (rating * (max - min) / 200) + min;
            if (min == 20) {
                grade = Math.round(grade / 5) * 5;
            } else {
                grade = Math.round(grade);
            }
            if (grade > min) {
                this.ratings[i] = String(grade);
                war = Math.round((slopes[i] * rating + intercepts[i]) * 10) / 10;
                this.wars[i] = war.toFixed(1);
                if (rating < 9)
                    this.colors[i] = "#A40000";
                else if (rating < 25)
                    this.colors[i] = "#CB0000";
                else if (rating < 42)
                    this.colors[i] = "#FD0000";
                else if (rating < 59)
                    this.colors[i] = "#FD6A00";
                else if (rating < 75)
                    this.colors[i] = "#FDBC00";
                else if (rating < 92)
                    this.colors[i] = "#EBDF08";
                else if (rating < 109)
                    this.colors[i] = "#BBD500";
                else if (rating < 125)
                    this.colors[i] = "#56D100";
                else if (rating < 142)
                    this.colors[i] = "#57CF1F";
                else if (rating < 159)
                    this.colors[i] = "#76D086";
                else if (rating < 179)
                    this.colors[i] = "#00C4C6";
                else if (rating < 192)
                    this.colors[i] = "#00C3E5";
                else
                    this.colors[i] = "#0095FB";
            } else if (rating != 0) {
                this.ratings[i] = String(min);
                this.colors[i] = "#A40000";
            }
        }
    }
}
