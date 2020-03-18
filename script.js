let btn_calculate = document.getElementById("form-button-calculate");
let txt_formError = document.getElementById("form-error");
let tbl_mainTable = document.getElementById("main-table");
let txt_periodName = document.getElementById("main-table-period");

btn_calculate.addEventListener("click", drawTable);

function drawTable() {
    let initSum = Number(document.getElementById("input-initsum").value);
    let periodDep = Number(document.getElementById("input-monthlydeposit").value);
    let incrPerc = Number(document.getElementById("input-percrate").value);
    let depTermDays = Number(document.getElementById("input-term").value);

    let periodType = document.getElementById("select-term").value;

    // -- Error checking
    let hasErrors = false;
    // reset the error message
    txt_formError.innerHTML = "";
    if (isNaN(initSum) || initSum <= 0) {
        txt_formError.innerHTML += "<p>Ошибка: начальная сумма должна быть больше нуля</p>";
        console.error("Ошибка: начальная сумма должна быть больше нуля");
        hasErrors = true;
    }

    if (isNaN(periodDep) || periodDep < 0) {
        txt_formError.innerHTML += "<p>Ошибка: сумма периодичного пополнения должна быть неотрицательной</p>";
        console.error("Ошибка: сумма периодичного пополнения должна быть неотрицательной");
        hasErrors = true;
    }

    if (isNaN(incrPerc) || incrPerc <= 0 || incrPerc > 100) {
        txt_formError.innerHTML += "<p>Ошибка: процентная ставка должна быть положительной, до 100%</p>";
        console.error("Ошибка: процентная ставка должна быть положительной, до 100%");
        hasErrors = true;
    }

    if (isNaN(depTermDays) || depTermDays < 0 || depTermDays % 1 !== 0) {
        txt_formError.innerHTML += "<p>Ошибка: срок вклада должен быть положительным, целым числом</p>";
        console.error("Ошибка: срок вклада должен быть положительным, целым числом");
        hasErrors = true;
    }

    // don't continue execution if there are errors
    if (hasErrors) return;

    // -- End of error checking

    // Determine the length of the period
    let periodLen = 0;
    switch (periodType) {
        case "monthly":
            periodLen = 1;
            break;
        case "quarterly":
            periodLen = 4;
            break;
        case "yearly":
            periodLen = 12;
            break;
        default:
            // We shouldn't ever get here unless someone messes with the HTML code :)
            console.error("Unknown value of the period type");
    }

    //
    let calcResult = calcPercent(initSum, periodDep, incrPerc, depTermDays, periodLen);

    // Reset the table
    clearTable(tbl_mainTable);
    // Draw the table
    for (const key in calcResult) {
        if (calcResult.hasOwnProperty(key)) {
            const element = calcResult[key];

            let row = tbl_mainTable.insertRow(-1);

            // Insert new cells (<td> elements)
            let cell0 = row.insertCell(0);
            let cell1 = row.insertCell(1);
            let cell2 = row.insertCell(2);
            let cell3 = row.insertCell(3);
            let cell4 = row.insertCell(4);
            let cell5 = row.insertCell(5);
            let cell6 = row.insertCell(6);

            // Add some text to the new cells:
            cell0.innerHTML = key;
            cell1.innerHTML = element["curPeriodLen"];
            cell2.innerHTML = element["initSum"].toFixed(2);
            cell3.innerHTML = (element["monthlyDep"].toFixed(2) == 0) ? "" : element["monthlyDep"].toFixed(2);
            cell4.innerHTML = element["incrperc"].toFixed(3) + "%";
            cell5.innerHTML = element["incrperc_value"].toFixed(2);
            cell6.innerHTML = element["finalSum"].toFixed(2);
            
        }
    }

}

function calcPercent(in_initSum, in_periodDep, in_incrperc, in_depTermDays, in_periodLen) {
    let result = {};
    let incrPercDec = in_incrperc / 100;

    let monthCount = Math.ceil(in_depTermDays / 30);

    let lastSum = in_initSum;
    let remDays = in_depTermDays;

    for (let i = 1; i < monthCount + 1; i++) {
        let curMonth = {};
        let depSum = (i % in_periodLen === 0) ? in_periodDep : 0;

        // Do not make a deposit in the first month
        let sumWithDeposit = lastSum + depSum;
        
        // Subtract the month length from remaining days. If it pushes remDays into negatives - 
        // the month is incomplete and we can get its duration by reverting subtraction (also called "adding" :) )
        remDays -= 30;
        let curMonthLen = (remDays > 0) ? 30 : remDays + 30;

        // Current month's increase is determined by its actual length
        // Calculate the actual percentage for the month as its length's ratio to the year's length (360 days)
        let curIncrPerc = curMonthLen * incrPercDec / 360;

        let finalSum = sumWithDeposit * (1 + curIncrPerc);

        // Pass the results into the resulting object for current month
        curMonth["initSum"] = lastSum;
        curMonth["curPeriodLen"] = curMonthLen;
        curMonth["monthlyDep"] = depSum;
        curMonth["incrperc"] = curIncrPerc * 100;
        curMonth["incrperc_value"] = finalSum - sumWithDeposit;
        curMonth["finalSum"] = finalSum;

        // Save the results for the current month in the results. The key corresponds to current months' number
        result[i.toString()] = curMonth;

        // Set the lastSum for the next round of calculation
        lastSum = finalSum;
    }

    return result;
}

function clearTable(in_table) {
    // Честно украдено из гугла :)
    let rows = in_table.rows;
    let i = rows.length;
    while (--i) {
        in_table.deleteRow(i);
    }
}