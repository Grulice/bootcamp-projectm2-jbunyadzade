let btn_calculate = document.getElementById("form-button-calculate");
let txt_formError = document.getElementById("form-error");
let tbl_mainTable = document.getElementById("main-table");
let txt_periodName = document.getElementById("main-table-period");

btn_calculate.addEventListener("click", drawTable);

function drawTable() {
    let initSum = Number(document.getElementById("input-initsum").value);
    let monthlyDep = Number(document.getElementById("input-monthlydeposit").value);
    let incrPerc = Number(document.getElementById("input-percrate").value);
    let depTermDays = Number(document.getElementById("input-term").value);

    let periodType = document.getElementById("select-term").value;

    // -- Error checking
    let hasErrors = false;
    // reset the error message
    txt_formError.innerHTML = "";
    if (isNaN(initSum) || initSum <= 0) {
        txt_formError.innerHTML += "<p>Ошибка: начальная сумма должна быть больше нуля</p>";
        hasErrors = true;
    }

    if (isNaN(monthlyDep) || monthlyDep < 0) {
        txt_formError.innerHTML += "<p>Ошибка: сумма периодичного пополнения должна быть неотрицательной</p>";
        hasErrors = true;
    }

    if (isNaN(incrPerc) || incrPerc < 0 || incrPerc > 100) {
        txt_formError.innerHTML += "<p>Ошибка: процентная ставка должна быть неотрицательной, до 100%</p>";
        hasErrors = true;
    }

    if (isNaN(depTermDays) || depTermDays < 0 || depTermDays % 1 !== 0) {
        txt_formError.innerHTML += "<p>Ошибка: срок вклада должен быть положительным, целым числом</p>";
        hasErrors = true;
    }

    // don't continue execution if there are errors
    if (hasErrors) return;

    // -- End of error checking

    // Determine the length of the period
    let periodLen = 0;
    switch (periodType) {
        case "monthly":
            txt_periodName.innerHTML = "Месяц";
            periodLen = 30;
            break;
        case "quarterly":
            txt_periodName.innerHTML = "Квартал";
            periodLen = 90;
            break;
        case "yearly":
            txt_periodName.innerHTML = "Год";
            periodLen = 360;
            break;
        default:
            // We shouldn't ever get here unless someone messes with the HTML code :)
            console.error("Unknown value of the period type");
    }

    //
    let calcResult = calcPercent(initSum, monthlyDep, incrPerc, depTermDays, periodLen);

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
            cell3.innerHTML = element["monthlyDep"].toFixed(2);
            cell4.innerHTML = element["incrperc"].toFixed(3) + "%";
            cell5.innerHTML = element["incrperc_value"].toFixed(2);
            cell6.innerHTML = element["finalSum"].toFixed(2);
            
        }
    }

}

function calcPercent(in_initSum, in_monthlyDep, in_incrperc, in_depTermDays, in_periodLen) {
    let result = {};
    let incrPercDec = in_incrperc / 100;

    let periodCount = Math.ceil(in_depTermDays / in_periodLen);

    let lastSum = in_initSum;
    let remDays = in_depTermDays;

    for (let i = 1; i < periodCount + 1; i++) {
        let curPeriod = {};

        // Do not make a deposit in the first month
        let sumWithDeposit = lastSum + ((i === 1) ? 0 : in_monthlyDep);
        
        // Subtract the period length from remaining days. If it pushes remDays into negatives - 
        // the period is incomplete and we can get its duration by reverting subtraction (also called "adding" :) )
        remDays -= in_periodLen;
        let curPeriodLen = (remDays > 0) ? in_periodLen : remDays + in_periodLen;

        // Current period's increase is determined by its actual length
        // Calculate the actual percentage for the period as its length's ratio to the year's length (360 days)
        let curIncrPerc = curPeriodLen * incrPercDec / 360;

        let finalSum = sumWithDeposit * (1 + curIncrPerc);

        // Pass the results into the resulting object for current period
        curPeriod["initSum"] = lastSum;
        curPeriod["curPeriodLen"] = curPeriodLen;
        curPeriod["monthlyDep"] = ((i === 1) ? 0 : in_monthlyDep);
        curPeriod["incrperc"] = curIncrPerc * 100;
        curPeriod["incrperc_value"] = finalSum - sumWithDeposit;
        curPeriod["finalSum"] = finalSum;

        // Save the results for the current period in the results. The key corresponds to current months' number
        result[i.toString()] = curPeriod;

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