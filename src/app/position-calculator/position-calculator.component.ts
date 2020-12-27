import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';

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

    constructor() { 
        this.scale = "20 to 80";
        this.useCm = false;
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
    }

    onChange(): void {
        this.useCm = !this.useCm;
        this.useIn = !this.useIn;

        if (this.useCm) {
            this.centimeters = Math.round(2.54 * (12 * this.feet + this.inches));
        } else {
            var inches = Math.round(this.centimeters / 2.54);
            this.feet = Math.floor(inches / 12);
            this.inches = inches % 12;
        }

        this.errorCm = false;
        this.errorIn = false;
    }

    onSubmit(event : Event): void {
        event.preventDefault();
        var valid = this.validate();
        if (valid) {
            this.calculatePositions();
        }
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
        var max = max * 1.4;

        this.errorRange = false;
        this.errorInterval = false;

        for (var i = 0; i < this.skills.length; ++i) {
            skill = this.skills[i];
            if (skill != null && (skill < min || skill > max)) {
                this.errorRange = true;
                break;
            } else if (this.scale == "20 to 80" && (skill % 5 != 0)) {
                this.errorInterval = true;
                break;
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
        for (var i = 0; i < converted.length; ++i) {
            if (this.skills[i] == null) {
                continue;
            }
            grade = this.skills[i];
            converted[i] = Math.ceil(((grade + half) - min) * 200 / (max - min) - 1);
        }

        var ratings = [0, 0, 0, 0, 0, 0, 0, 0];

        // Calculate catcher
        if (!this.errorCatcher) {
            ratings[0] = 0.78 * (converted[0] + converted[1]) - 62;
        }

        // Calculate 1B
        var height;
        if (this.useIn) {
            height = Math.round(30.48 * this.feet + 2.54 * this.inches);
        } else {
            height = this.centimeters;
        }
        if (height > 0 && !this.errorInfield) {
            var range;
            var error;
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
            var arm = converted[4] / 70;
            var turn = converted[5] / 70;
            var hfac = 1 + (height - 155) / 15;
            console.log(range, error, arm, turn);
            console.log(hfac);
            ratings[1] = hfac * (range + error + arm + turn);
        }

        // Calculate rest of IF
        if (!this.errorInfield && !this.lefty) {
            ratings[2] = 0.86 * converted[2] + 0.33 * converted[3] + 0.07 * converted[4] + 0.39 * converted[5] - 77;
            ratings[3] = 0.51 * converted[2] + 0.29 * converted[3] + 0.89 * converted[4] + 0.13 * converted[5] - 109;
            ratings[4] = 1.02 * converted[2] + 0.3 * converted[3] + 0.09 * converted[4] + 0.35 * converted[5] - 125;
        }

        // Calculate OF
        if (!this.errorOutfield) {
            ratings[5] = 1.17 * converted[6] + 0.15 * converted[7] + 0.23 * converted[8] - 45;
            ratings[6] = 1.71 * converted[6] + 0.14 * converted[7] + 0.07 * converted[8] - 162;
            ratings[7] = 1.02 * converted[6] + 0.16 * converted[7] + 0.45 * converted[8] - 75;
        }

        console.log("Error: " + this.errorOutfield);
        console.log(converted);
        console.log(ratings);

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
