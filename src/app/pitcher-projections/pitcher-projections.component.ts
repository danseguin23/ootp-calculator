import { Component, OnInit } from '@angular/core';
import { Pitcher, PitcherStats } from '../data-classes';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-pitcher-projections',
  templateUrl: './pitcher-projections.component.html',
  styleUrls: ['./pitcher-projections.component.css']
})
export class PitcherProjectionsComponent implements OnInit {

    teams = ["-", "ARI", "ATL", "BAL", "BOS", "CHC", "CIN", "CLE", "COL", "CWS", "DET", "HOU", "KC", "LAA", "LAD", "MIA", "MIL", "MIN", "NYM", "NYY", "OAK", "PHI", "PIT", "SD", "SEA", "SF", "STL", "TB", "TEX", "TOR", "WSH"];
    scale: string;
    editing: boolean;
    name: string;
    team: string;
    pos: string;
    gbfb: string;
    stuff: number;
    movement: number;
    control: number;
    stamina: number;
    hold: number;
    errorFields: boolean;
    errorRange: boolean;
    errorInterval: boolean;
    valid: boolean;
    pitchers: Pitcher[];
    stats: PitcherStats[];
    cookies;

    constructor(private cookieService: CookieService) {
        var scale = this.cookieService.get("scale");
        if (scale == "") {
            this.scale = "20 to 80";
        } else {
            this.scale = scale;
        }
        this.pos = "-";
        this.clearInput();
        this.valid = true;
        this.pitchers = [];
        this.stats = [];
    }

    ngOnInit(): void {
        var cookies = this.cookieService.getAll();
        this.cookies = [];

        var i = 0;
        for (var cookie in cookies) {
            if (cookie.substr(0, 7) == "pitcher") {
                this.pitchers.push(JSON.parse(cookies[cookie]));
                this.stats.push(new PitcherStats(this.pitchers[i]));
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
            // Add pitcher
            var pitcher = new Pitcher(this.name, this.team, this.pos);
            pitcher.gbfb = this.gbfb;
            pitcher.stuff = this.fromScout(this.stuff, this.scale);
            pitcher.movement = this.fromScout(this.movement, this.scale);
            pitcher.control = this.fromScout(this.control, this.scale);
            pitcher.stamina = this.fromScout(this.stamina, this.scale);
            pitcher.hold = this.fromScout(this.hold, this.scale);
            var cookie = JSON.stringify(pitcher);
            this.cookieService.set(pitcher.id, cookie, 32767);
            this.pitchers.push(pitcher);
            this.stats.push(new PitcherStats(pitcher));
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
        var rates = [this.stuff, this.movement, this.control, this.stamina, this.hold];
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

    editPitcher(pitcher : Pitcher) {
        if (this.editing) {
            this.onSubmit();
        }
        this.clearErrors();
        this.name = pitcher.name;
        this.team = pitcher.team;
        this.pos = pitcher.pos;
        this.gbfb = pitcher.gbfb;
        this.stuff = this.toScout(pitcher.stuff, this.scale);
        this.movement = this.toScout(pitcher.movement, this.scale);
        this.control = this.toScout(pitcher.control, this.scale);
        this.stamina = this.toScout(pitcher.stamina, this.scale);
        this.hold = this.toScout(pitcher.hold, this.scale);
        //this.cookieService.delete(batter.id);
        this.removePitcher(pitcher.id);
        this.editing = true;
    }

    removePitcher(id : string) {
        var i = 0;
        for (let pitcher of this.pitchers) {
            if (pitcher.id == id) {
                break;
            } else {
                ++i;
            }
        }
        this.pitchers.splice(i, 1);
        this.stats.splice(i, 1);
    }

    clearInput() {
        if (this.editing) {
            var id = "pitcher-" + this.name;
            this.cookieService.delete(id);
        }
        this.editing = false;
        this.name = "";
        this.team = this.cookieService.get("team");
        this.pos = "-";
        this.gbfb = "NEU";
        this.stuff = null;
        this.movement = null;
        this.control = null;
        this.stamina = null;
        this.hold = null;
        this.errorFields = false;
        this.errorRange = false;
        this.errorInterval = false;
        this.clearErrors();
    }

    clearOutput() {
        var cookies = this.cookieService.getAll()
        for (var cookie in cookies) {
            if (cookie.substr(0, 7) == "pitcher") {
                this.cookieService.delete(cookie);
            }
        }
        this.pitchers = [];
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
        this.stuff = null;
        this.movement = null;
        this.control = null;
        this.stamina = null;
        this.hold = null;
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
