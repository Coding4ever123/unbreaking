import lw from "lightwrite";
import $ from "jquery";
$();
let reportsEle = $(".reports");
function getSettings() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
        return "dark";
    return "light";
}
function setTheme(theme: "dark" | "light") {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);

    $("input#theme").prop("checked", theme === "dark");
}

/**
 * Gets The list by passing in a page perameter, the first page is always 0
 */
async function fetchList(
    page: number
): Promise<
    { time: Date; fields: Record<string, any[]>; uuid: string }[] | "OFFLINE"
> {
    try {
        let req = await fetch("api/getAllRecords/" + page);
        let json: {
            time: number;
            fields: Record<string, any>;
            uuid: string;
        }[] = await req.json();
        return json.map((value) => {
            let uuid = value.uuid;
            let time = new Date(value.time);
            let fields = Object.fromEntries(
                Object.entries(value.fields).map(([key, value]) => {
                    return [key, value[0]];
                })
            );
            return { time, fields, uuid };
        });
    } catch (e) {
        return "OFFLINE";
    }
}
/**
 * Gets the Amount of pages
 */
async function getAmountPages(): Promise<number> {
    let req = await fetch("api/getAmountPages");
    return parseInt(await req.text());
}

async function update(page: number, pages: number) {
    reportsEle.html(lw.as.string(lw("div").class("loader")));
    $("button.prevPage").prop("disabled", page === 1);
    $("button.nextPage").prop("disabled", page >= pages);
    updateList(page);
}
function setLoader() {
    reportsEle.html('<div class="loader"></div>');
}

async function updateList(page: number) {
    let list = await fetchList(page - 1);
    reportsEle.html("");
    let recordListEle = $(".list.RecordList");
    if (list === "OFFLINE") {
        recordListEle.addClass("error");
        $(".list.RecordList .Error").replaceWith(
            lw.as.element(
                lw("h1").class("Error")(
                    "You are offline!",
                    lw("i").class("fa-classic fa-solid fa-wifi-slash")
                )
            )
        );
        return;
    }
    recordListEle.removeClass("error");
    list.forEach((x) => {
        let element = lw("a")
            .class("reset")
            .href("#" + x.uuid)(
            lw("p")(x.time.toLocaleString()),
            lw("p")("UUID: " + x.uuid)
        );
        reportsEle.append(lw.as.element(element));
    });
}
function isEmpty(obj: Record<any, any>): boolean {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }

    return true;
}

async function showRecord(uuid: string) {
    $(".RecordList").addClass("hidden");
    $(".Record").removeClass("hidden");
    let record = await getRecord(uuid);
    let recordEle = $(".list.Record");
    if (record === "OFFLINE") {
        recordEle.removeClass("error");
        $(".Record .Error").replaceWith(
            lw.as.element(
                lw("h1").class("Error")(
                    "You are offline!",
                    lw("i").class("fa-classic fa-solid fa-wifi-slash")
                )
            )
        );
        return;
    }
    if (isEmpty(record)) {
        recordEle.addClass("error");
        $(".Error").replaceWith(
            lw.as.element(lw("h1").class("Error")("Record does not exist!"))
        );
        return;
    }
    recordEle.removeClass("error");
    $(".uuid-and-time").replaceWith(
        lw.as.element(
            lw("div").class("uuid-and-time")(
                lw("span")("UUID: " + record.uuid),
                lw("span")("Time: " + record.time.toLocaleString())
            )
        )
    );
    $(".fields").replaceWith(
        lw.as.element(
            lw("ul").class("fields")(
                Object.entries(record.fields).map((x) =>
                    lw("li")(`${x[0]}: ${x[1]}`)
                )
            )
        )
    );
}

async function getRecord(
    uuid: string
): Promise<
    { time: Date; fields: Record<string, any[]>; uuid: string } | "OFFLINE"
> {
    try {
        let req = await fetch("api/getRecord/" + uuid);
        let resp: { time: number; fields: Record<string, any>; uuid: string } =
            await req.json();
        if (isEmpty(resp)) return;
        let fields = Object.fromEntries(
            Object.entries(resp.fields).map(([key, value]) => {
                return [key, value[0]];
            })
        );
        let time = new Date(resp.time);

        return { time, fields, uuid };
    } catch (e) {
        return "OFFLINE";
    }
}

function SetListVisible() {
    $(".RecordList").removeClass("hidden");
    $(".Record").addClass("hidden");
}

async function init() {
    let pages = await getAmountPages();
    let currentPage = 1;
    setTheme(getSettings());

    $("input#theme").on("input", function () {
        setTheme($(this).prop("checked") ? "dark" : "light");
    });
    $("span.AmountPages").text(pages.toString());
    $("button.reload").on("click", async function () {
        update(currentPage, pages);
    });
    let pageInput = $("input#page");
    $(".nextPage").on("click", function () {
        pageInput.val((pageInput.val() as number) + 1);
        update(currentPage, pages);
    });
    $(".prevPage").on("click", function () {
        pageInput.val((pageInput.val() as number) - 1);
        update(currentPage, pages);
    });
    function changeListener() {
        let value = parseInt(this.value);
        if (1 > value) value = 1;
        if (pages < value) value = pages;

        this.value = value;

        currentPage = value;
        update(currentPage, pages);
        this.blur();
        resizeInput.call(this);
    }

    pageInput.on("keydown", function (e) {
        if (e.code === "Period" || e.code === "Enter") e.preventDefault();
        if (e.code === "Enter") changeListener.call(this);
    });
    pageInput.on("change", changeListener);
    function resizeInput() {
        let $this = $(this);
        $this.css("width", $this.val() + "ch");
    }
    resizeInput.call(pageInput);
    pageInput.on("input", resizeInput);

    update(currentPage, pages);
    function hashChange() {
        if (location.hash.length === 0) return SetListVisible();
        let hash = location.hash.substring(1);
        if (hash.length === 0) return SetListVisible();
        showRecord(hash);
    }
    window.onhashchange = hashChange;
    hashChange();
}
init();
