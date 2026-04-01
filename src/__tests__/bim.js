import { Store } from "../flux";
import XLSX from "xlsx";
import Dispatcher from "../flux/dispatcher";
import { existsSync } from "fs";

// For Sheet[0]
const restructureJSON = (data) => {
    const reconData = data.map(
        (item) =>
            item.KumpulanKategori !== undefined &&
            item.GroupCategory !== undefined &&
            item.Word !== undefined &&
            item.Perkataan !== undefined && {
                // replaceAll -> replace for testing
                kumpulanKategori: item.KumpulanKategori.toString().replace(
                    /(\r\n|\n|\r)/gm,
                    ""
                ),
                groupCategory: item.GroupCategory.toString().replace(
                    /(\r\n|\n|\r)/gm,
                    ""
                ),
                word: item.Word.toString().trim(),
                perkataan: item.Perkataan.toString().trim(),
                video: item.Video,
                tag: item.Tag,
                release: item.Release,
                new: item.New,
                order: item.Order,
                sotd: item.SOTD,
                imgStatus: item.ImageStatus,
            }
    );
    // Removing release filtering - include all releases
    return filterExcelData(reconData, []);
};

const filterExcelData = (excelData, releases) => {
    return excelData
        .filter((group) => group !== false) // filter out those without any value
        .filter((group) =>
            releases.length === 0 || (Array.isArray(releases)
                ? releases.includes(group.release)
                : group.release === releases)
        ) // filter only if releases array is not empty
        .sort(
            (a, b) => a.kumpulanKategori.localeCompare(b.kumpulanKategori) // sort the entries alphabetically based on the Kategori
        );
};

// For Sheet[1]
const restructureJSONGroup = (data) => {
    const reconData = data.map(
        (item) =>
            item.KumpulanKategori !== undefined &&
            item.GroupCategory !== undefined && {
                kumpulanKategori: item.KumpulanKategori.trim(),
                groupCategory: item.GroupCategory.trim(),
                remark: item.Remark,
            }
    );
    return reconData.filter((group) => group !== false);
};

// Read xlsx in public
const readExcelTest = async (sheet) => {
    const file = "public/assets/BIM.xlsx";
    const promise = new Promise((resolve, reject) => {
        const wb = XLSX.readFile(file);
        const wsVocabs = wb.Sheets[wb.SheetNames[sheet]];
        const data = XLSX.utils.sheet_to_json(wsVocabs);
        const reconData =
            sheet === 0 ? restructureJSON(data) : restructureJSONGroup(data);
        resolve(reconData);
    });
    return promise;
};

beforeEach(() => {
    readExcelTest(0).then((value) => {
        Dispatcher.dispatch({
            actionType: "STORE_EXCEL",
            payload: value,
        });
    });
    readExcelTest(1).then((value) => {
        Dispatcher.dispatch({
            actionType: "STORE_EXCEL_GROUP",
            payload: value,
        });
    });
});

// Test for BIM.xlsx file existence
test("Test 1: BIM.xlsx should exist at public/assets/BIM.xlsx ", () => {
    const dirBIM = "public/assets/BIM.xlsx";
    expect.extend({
        fileExist(dir) {
            try {
                if (existsSync(dir)) {
                    return {
                        message: () => `BIM.xlsx is in the correct directory.`,
                        pass: true,
                    };
                } else {
                    return {
                        message: () =>
                            `BIM.xlsx does not exist. Please add the BIM into the correct directory.`,
                        pass: false,
                    };
                }
            } catch (error) {}
        },
    });
    expect(dirBIM).fileExist();
});

// Test existence of image source corresponding to words
test("Test 2: Image jpg file should exist corresponding to the bim words", () => {
    expect.extend({
        toExist(word) {
            try {
                const pass = existsSync(`src/images/bim/vocab/${word}.jpg`);

                if (pass) {
                    return {
                        message: () => `All images exists.`,
                        pass: true,
                    };
                } else {
                    return {
                        message: () =>
                            `${word}.jpg does not exist. Please add ${word}.jpg into src/images/bim/vocab`,
                        pass: false,
                    };
                }
            } catch (error) {}
        },
    });
    Store.getVocabsItems().forEach((vocab) => {
        if (vocab.imgStatus === "Pending") {
            return;
        } else {
            expect(vocab.perkataan).toExist();
        }
    });
});

// Test Category in BIM Tab existence in Group Tab
test("Test 3: Category in BIM Tab should exist according to Category in Group Tab", () => {
    // Put Category column into array
    const cat = Store.getGroupCategoryItems().map((item) => item.groupCategory);
    expect.extend({
        toHaveOneOf(cat, groupCat) {
            if (cat.includes(groupCat)) {
                return {
                    message: () => `All categories matches correctly.`,
                    pass: true,
                };
            } else {
                return {
                    message: () =>
                        `${groupCat} mismatched. Please check the spelling or add the correct category inside the Category column (BIM sheet).`,
                    pass: false,
                };
            }
        },
    });

    Store.getVocabItem().forEach((vocab) => {
        expect(cat).toHaveOneOf(...vocab.groupCategory);
    });
});

// Test for Youtube video links
test("Test 4: Youtube video link is a URL", () => {
    const isValidHttpUrl = (string) => {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    };

    expect.extend({
        isValid(uri) {
            if (isValidHttpUrl(uri)) {
                return {
                    message: `All links are valid.`,
                    pass: true,
                };
            } else {
                return {
                    message: `${uri} is invalid. Please re-copy the valid link and replace.`,
                    pass: false,
                };
            }
        },
    });

    Store.getVocabsItems().forEach((url) => {
        expect(url.video).isValid();
    });
});

// Test for SignOfTheDay date format
test("Test 5:SignOfTheDay date should be written according to standard format", () => {
    const sotdDate = Store.getVocabsItems()
        .filter((und) => und.sotd !== undefined)
        .map((date) => date.sotd.toString());
    const regEx = /^\d{4}-\d{2}-\d{2}$/;

    expect.extend({
        matches(date, regex) {
            if (date.match(regex)) {
                return {
                    message: "All date format is valid.",
                    pass: true,
                };
            } else {
                return {
                    message: `${date} format is invalid. Please write according to the correct format (yyyy-mm-dd).`,
                    pass: false,
                };
            }
        },
    });
    sotdDate.forEach((date) => expect(date).matches(regEx));
});
