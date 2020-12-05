$(document).ready(() => {
    $("#calculator").submit(calculate_value);
});

function calculate_value(event)
{
    // Don't reload IG
    event.preventDefault();

    // Important variables
    var scale = document.getElementById("scale").value.split(" ");
    var min = Number(scale[0]);
    var max = Number(scale[2]);
    var feet = Number(document.getElementById("feet").value);
    var inches = Number(document.getElementById("inches").value);
    var cm = Number(document.getElementById("centimeters").value);
    var lefty = $("#lefty").prop("checked");
    var cabil = Number(document.getElementById("cabil").value);
    var carm = Number(document.getElementById("carm").value);
    var irng = Number(document.getElementById("irng").value);
    var ierr = Number(document.getElementById("ierr").value);
    var iarm = Number(document.getElementById("iarm").value);
    var dp = Number(document.getElementById("dp").value);
    var orng = Number(document.getElementById("orng").value);
    var oerr = Number(document.getElementById("oerr").value);
    var oarm = Number(document.getElementById("oarm").value);

    ratings = ["-", "-", "-", "-", "-", "-", "-", "-"];
    wars = ["-", "-", "-", "-", "-", "-", "-", "-"];
    colors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];

    var valid = validate(min, max, feet, inches, cm, cabil, carm, irng, ierr, iarm, dp, orng, oerr, oarm);
    // Validate
    if (valid[0] && valid[1])
    {
        dif = max - min;
        var step = 1;
        if (min == 20 && max == 80)
            step = 5;
        slopes = [0.003, 0.009, 0.018, 0.015, 0.024, 0.009, 0.015, 0.009];
        intercepts = [1.1, -1.75, -1.5, -1.05, -1.8, -1.3, -1.15, -1.25];
        numeric = [0, 0, 0, 0, 0, 0, 0, 0];
        height = cm;
        if (height == 0)
            height = 2.54 * (12 * feet + inches);
        cabil = (cabil - min) * (200 / dif) + step / 2;
        carm = (carm - min) * (200 / dif) + step / 2;
        irng = (irng - min) * (200 / dif) + step / 2;
        ierr = (ierr - min) * (200 / dif) + step / 2;
        iarm = (iarm - min) * (200 / dif) + step / 2;
        dp = (dp - min) * (200 / dif) + step / 2;
        orng = (orng - min) * (200 / dif) + step / 2;
        oerr = (oerr - min) * (200 / dif) + step / 2;
        oarm = (oarm - min) * (200 / dif) + step / 2;

        numeric[0] = 0.78 * cabil + 0.78 * carm - 62;
        numeric[1] = 3.4 * height + 0.42 * irng + 0.24 * ierr + 0.03 * iarm + 0.03 * dp - 548;
        numeric[2] = 0.86 * irng + 0.33 * ierr + 0.07 * iarm + 0.39 * dp - 77;
        numeric[3] = 0.51 * irng + 0.29 * ierr + 0.89 * iarm + 0.13 * dp - 109;
        numeric[4] = 1.02 * irng + 0.3 * ierr + 0.09 * iarm + 0.35 * dp - 125;
        numeric[5] = 1.17 * orng + 0.15 * oerr + 0.23 * oarm - 45;
        numeric[6] = 1.71 * orng + 0.14 * oerr + 0.07 * oarm - 162;
        numeric[7] = 1.02 * orng + 0.16 * oerr + 0.45 * oarm - 75;

        // Calculate ratings and WAR
        for (var i = 0; i < 8; ++i)
        {
            if (i == 0 && !valid[2])
                continue;
            else if (i == 1 && !valid[3])
                continue;
            else if ((i >= 2 && i <= 4) && (!valid[4] || lefty))
                continue;
            else if (i >= 5 && !valid[5])
                continue;
            var rate = dif / 200 * numeric[i] + min;

            if (min == 20 && max == 80)
                rate = Math.round(rate / 5) * 5;
            else if (min == 1 && max == 100)
                rate = Math.round(rate) - 1;
            else
                rate = Math.round(rate);
            
            var war = Math.round((slopes[i] * numeric[i] + intercepts[i]) * 10) / 10;
            wars[i] = war.toFixed(1);
            if (rate < min)
                ratings[i] = String(min);
            else
                ratings[i] = String(rate);

            if (numeric[i] < 9)
                colors[i] = "#A40000";
            else if (numeric[i] < 25)
                colors[i] = "#CB0000";
            else if (numeric[i] < 42)
                colors[i] = "#FD0000";
            else if (numeric[i] < 59)
                colors[i] = "#FD6A00";
            else if (numeric[i] < 75)
                colors[i] = "#FDBC00";
            else if (numeric[i] < 92)
                colors[i] = "#EBDF08";
            else if (numeric[i] < 109)
                colors[i] = "#BBD500";
            else if (numeric[i] < 125)
                colors[i] = "#56D100";
            else if (numeric[i] < 142)
                colors[i] = "#57CF1F";
            else if (numeric[i] < 159)
                colors[i] = "#76D086";
            else if (numeric[i] < 179)
                colors[i] = "#00C4C6";
            else if (numeric[i] < 192)
                colors[i] = "#00C3E5";
            else
                colors[i] = "#0095FB";
        }

        $("#rate-catcher").text(ratings[0]);
        $("#rate-catcher").css("color", colors[0]);
        $("#rate-catcher").css("font-weight", "bold");
        $("#war-catcher").text(wars[0]);
        $("#rate-first").text(ratings[1]);
        $("#war-first").text(wars[1]);
        $("#rate-first").css("color", colors[1]);
        $("#rate-first").css("font-weight", "bold");
        $("#rate-second").text(ratings[2]);
        $("#rate-third").text(ratings[3]);
        $("#rate-shortstop").text(ratings[4]);
        $("#war-second").text(wars[2]);
        $("#war-third").text(wars[3]);
        $("#war-shortstop").text(wars[4]);
        $("#rate-second").css("color", colors[2]);
        $("#rate-second").css("font-weight", "bold");
        $("#rate-third").css("color", colors[3]);
        $("#rate-third").css("font-weight", "bold");
        $("#rate-shortstop").css("color", colors[4]);
        $("#rate-shortstop").css("font-weight", "bold");
        $("#rate-left").text(ratings[5]);
        $("#rate-center").text(ratings[6]);
        $("#rate-right").text(ratings[7]);
        $("#war-center").text(wars[6]);
        $("#war-left").text(wars[5]);
        $("#war-right").text(wars[7]);
        $("#rate-left").css("color", colors[5]);
        $("#rate-left").css("font-weight", "bold");
        $("#rate-center").css("color", colors[6]);
        $("#rate-center").css("font-weight", "bold");
        $("#rate-right").css("color", colors[7]);
        $("#rate-right").css("font-weight", "bold");
    }
}

function validate(min, max, feet, inches, cm, cabil, carm, irng, ierr, iarm, dp, orng, oerr, oarm) 
{
    
    var hvalid = true;  // valid height
    var rvalid = true;  // valid range
    var cvalid = false;  // valid catcher ratings
    var fvalid = false;  // valid first base ratings
    var ivalid = false;  // valid infield ratings
    var ovalid = false;  // valid outfield ratings

    if (feet < 0)
        hvalid = false;
    else if (inches < 0)
        hvalid = false;
    else if (cm < 0)
        hvalid = false;

    max = max * 1.4;

    if (cabil != 0 && min > cabil || cabil > max)
        rvalid = false;
    else if (carm != 0 && min > carm || carm > max)
        rvalid = false;
    else if (irng != 0 && min > irng || irng > max)
        rvalid = false;
    else if (ierr != 0 && min > ierr || ierr > max)
        rvalid = false;
    else if (iarm != 0 && min > iarm || iarm > max)
        rvalid = false;
    else if (dp != 0 && min > dp || dp > max)
        rvalid = false;
    else if (orng != 0 && min > orng || orng > max)
        rvalid = false;
    else if (oerr != 0 && min > oerr || oerr > max)
        rvalid = false;
    else if (oarm != 0 && min > oarm || oarm > max)
        rvalid = false;
    

    if (hvalid && rvalid)
    {
        cvalid = (cabil > 0) && (carm > 0);
        ivalid = (irng > 0) && (ierr > 0) && (iarm > 0) && (dp > 0);
        fvalid = ivalid && (((12 * feet + inches) > 0 || cm > 0));
        ovalid = (orng > 0) && (oerr > 0) && (oarm > 0);

        if (!cvalid && !ivalid && !ovalid)
            $("#error-group").attr("hidden", false);
        else
            $("#error-group").attr("hidden", true);
    } else
        $("#error-group").attr("hidden", true);

    $("#error-height").attr("hidden", hvalid);
    $("#error-range").attr("hidden", rvalid);

    return [hvalid, rvalid, cvalid, fvalid, ivalid, ovalid];
}

function onChange()
{
    var cm = $("#unit-check").prop("checked");
    $("#label-ft-in").attr("hidden", cm);
    $("#div-ft").attr("hidden", cm);
    $("#div-in").attr("hidden", cm);
    $("#label-cm").attr("hidden", !cm);
    $("#div-cm").attr("hidden", !cm);
    var feet = Number(document.getElementById("feet").value);
    var inch = Number(document.getElementById("inches").value);
    var centi = Number(document.getElementById("centimeters").value);

    if (cm && feet > 0)
    {
        var convert = String(Math.round(2.54 * (12 * feet + inch)));
        $("#centimeters").attr("value", convert);
    } else if (centi > 0)
    {
        var inches = Math.round(centi / 2.54);
        var cinch = inches % 12;
        var cfoot = (inches - cinch) / 12;
        $("#feet").attr("value", String(cfoot));
        $("#inches").attr("value", String(cinch));
    }
}