import { Component, OnInit } from '@angular/core';
import { Batter, BatterStats } from '../data-classes';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-batter-projections',
    templateUrl: './batter-projections.component.html',
    styleUrls: ['./batter-projections.component.css']
})
export class BatterProjectionsComponent implements OnInit {
    teams = ["-", "ARI", "ATL", "BAL", "BOS", "CHC", "CIN", "CLE", "COL", "CWS", "DET", "HOU", "KC", "LAA", "LAD", "MIA", "MIL", "MIN", "NYM", "NYY", "OAK", "PHI", "PIT", "SD", "SEA", "SF", "STL", "TB", "TEX", "TOR", "WSH"];
    scale: string;
    editing: boolean;
    name: string;
    team: string;
    pos: string;
    bats: string;
    contact: number;
    gap: number;
    power: number;
    eye: number;
    avoid: number;
    speed: number;
    stealing: number;
    defense: number;
    errorFields: boolean;
    errorRange: boolean;
    errorInterval: boolean;
    valid: boolean;
    batters: Batter[];
    stats: BatterStats[];
    cookies;

    constructor(private cookieService: CookieService) {
        var scale = this.cookieService.get("scale");
        if (scale == "") {
            this.scale = "20 to 80";
        } else {
            this.scale = scale;
        }
        this.pos = "-";
        this.bats = "-";
        this.clearInput();
        this.valid = true;
        this.batters = [];
        this.stats = [];
    }

    ngOnInit(): void {
        var cookies = this.cookieService.getAll();
        this.cookies = [];

        var i = 0;
        for (var cookie in cookies) {
            if (cookie.substr(0, 6) == "batter") {
                this.batters.push(JSON.parse(cookies[cookie]));
                this.stats.push(new BatterStats(this.batters[i]));
                i++;
            } else if (cookie == "team") {
                this.team = cookies[cookie];
            }
        }

        if (this.team == null || this.team == "") {
            this.team = "-";
        }
    }

    onSubmit() {
        this.validate();
        if (this.valid) {
            // Add batter
            var batter = new Batter(this.name, this.team, this.pos, this.bats);
            batter.contact = this.fromScout(this.contact, this.scale);
            batter.gap = this.fromScout(this.gap, this.scale);
            batter.power = this.fromScout(this.power, this.scale);
            batter.eye = this.fromScout(this.eye, this.scale);
            batter.avoid = this.fromScout(this.avoid, this.scale);
            batter.speed = this.fromScout(this.speed, this.scale);
            batter.stealing = this.fromScout(this.stealing, this.scale);
            batter.defense = this.fromScout(this.defense, this.scale);
            var cookie = JSON.stringify(batter);
            this.cookieService.set(batter.id, cookie, 32767);
            this.batters.push(batter);
            this.stats.push(new BatterStats(batter));
            this.cookieService.set("team", this.team, 32767);
            this.editing = false;
            this.clearInput();
        }
    }

    validate() {
        // Do some mf validation
        var scale = this.scale.split(" ");
        var min = Number(scale[0]);
        var max = Number(scale[2]) * 1.4;
        var rates = [this.contact, this.gap, this.power, this.eye, this.avoid, this.speed, this.stealing, this.defense];
        this.errorFields = false;
        this.errorRange = false;
        this.errorInterval = false;
        if (this.name == "") {
            this.errorFields = true;
        } else {
            for (var rate of rates) {
                if (rate == null) {
                    this.errorFields = true;
                    break;
                } else if (rate < min || rate > max) {
                    this.errorRange = true;
                    break;
                } else if (min == 20 && rate % 5 != 0) {
                    this.errorInterval = true;
                    break;
                }
            }
        }
        this.valid = !(this.errorFields || this.errorRange || this.errorInterval);
    }

    editBatter(batter : Batter) {
        if (this.editing) {
            this.onSubmit();
        }
        this.clearErrors();
        this.name = batter.name;
        this.team = batter.team;
        this.pos = batter.pos;
        this.bats = batter.bats;
        this.contact = this.toScout(batter.contact, this.scale);
        this.gap = this.toScout(batter.gap, this.scale);
        this.power = this.toScout(batter.power, this.scale);
        this.eye = this.toScout(batter.eye, this.scale);
        this.avoid = this.toScout(batter.avoid, this.scale);
        this.speed = this.toScout(batter.speed, this.scale);
        this.stealing = this.toScout(batter.stealing, this.scale);
        this.defense = this.toScout(batter.defense, this.scale);
        //this.cookieService.delete(batter.id);
        this.removeBatter(batter.id);
        this.editing = true;
    }

    removeBatter(id : string) {
        var i = 0;
        for (let batter of this.batters) {
            if (batter.id == id) {
                break;
            } else {
                ++i;
            }
        }
        this.batters.splice(i, 1);
        this.stats.splice(i, 1);
    }

    clearInput() {
        if (this.editing) {
            var id = "batter-" + this.name;
            this.cookieService.delete(id);
        }
        this.editing = false;
        this.name = "";
        this.team = this.cookieService.get("team");
        this.pos = "-";
        this.bats = "-";
        this.contact = null;
        this.gap = null;
        this.power = null;
        this.eye = null;
        this.avoid = null;
        this.speed = null;
        this.stealing = null;
        this.defense = null;
        this.errorFields = false;
        this.errorRange = false;
        this.errorInterval = false;
        this.clearErrors();
    }

    clearOutput() {
        var cookies = this.cookieService.getAll()
        for (var cookie in cookies) {
            if (cookie.substr(0, 6) == "batter") {
                this.cookieService.delete(cookie);
            }
        }
        this.batters = [];
        this.stats = [];
    }

    clearErrors() {
        this.errorFields = false;
        this.errorRange = false;
        this.errorInterval = false;
        this.valid = true;
    }

    scaleChange() {
        this.cookieService.set("scale", this.scale, 32767);
        this.contact = null;
        this.gap = null;
        this.power = null;
        this.eye = null;
        this.avoid = null;
        this.speed = null;
        this.stealing = null;
        this.defense = null;
    }

    // Convert from 1-250 rate to scouting grade
    toScout(rate, scale) : number{
        scale = scale.split(" ");
        var min = Number(scale[0]);
        var max = Number(scale[2]);
        var grade = rate * (max - min) / 200 + min;
        if (min == 20) {
            grade = Math.round(grade / 5) * 5;
        } else {
            grade = Math.round(grade);
        }
        return grade;
    }

    // Convert from scouting grade to 1-250 scale
    fromScout(grade, scale) : number {
        scale = scale.split(" ");
        var min = Number(scale[0]);
        var max = Number(scale[2]);
        var rate = (grade - min) * (200 / (max - min));
        return Math.round(rate);
    }
}
