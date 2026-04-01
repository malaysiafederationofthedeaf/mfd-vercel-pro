import {Store} from "../flux";

const groupCategoryItems = 
[            
    {kumpulanKategori: "Am/Abjad", groupCategory: "General/Alphabet", remark: undefined},
    {kumpulanKategori: "Am/Angka", groupCategory: "General/Number", remark: undefined},
    {kumpulanKategori: "Kehidupan/Pekerjaan", groupCategory: "Daily Life/Occupation", remark: undefined}
];

const vocabsItems =     
[
    {kumpulanKategori: "Am/Angka", groupCategory: "General/Number", word: "One, 1", perkataan: "1, Satu", video: "https://youtu.be/uxAbFIcd-Js", release: "Release 1", tag: undefined},
    {kumpulanKategori: "Am/Angka", groupCategory: "General/Number", word: "Two, 2", perkataan: "2, Dua", video: "https://youtu.be/g8PbfgMqdh0", release: "Release 1", tag: undefined},
    {kumpulanKategori: "Orang/Pekerjaan,Kesihatan/Kecacatan", groupCategory: "People/Occupation,Health/Disabilities", word: "Sign language interpreter", perkataan: "Jurubahasa isyarat", video: "https://youtu.be/U3VLfYXqabk", release: "Release 2", tag: undefined}
];

const vocabItem =           
[
    {kumpulanKategori: "Am/Warna", groupCategory: ["General/Colours"], word: "Blue", perkataan: "Biru", video: "https://youtu.be/3YeJeK3BCzA", release: "Release 1", tag: undefined},
    {kumpulanKategori: "Orang/Pekerjaan", groupCategory: ["People/Occupation"], word: "Fireman", perkataan: "Ahli bomba", video: "https://youtu.be/qi_tDJdJtCI", release: "Release 1", tag: undefined},
    {kumpulanKategori: "Kesihatan/Kecacatan,Orang/Pekerjaan", groupCategory: ["Health/Disabilities", "People/Occupation"], word: "Sign Language Interpreter", perkataan: "Jurubahasa Isyarat", video: "https://youtu.be/iklx7eWnC_o", release: "Release 1", tag: undefined}        
];

const groups =           
[
    {group: "General", kumpulan: "Am", remark: "Home"}, 
    {group: "Daily Life", kumpulan: "Kehidupan", remark: "Home"},
    {group: "Health", kumpulan: "Kesihatan", remark: undefined} 
];

describe('Test get categories of a group function', () => {
    let getGroupCategoryItemsSpy;
    let isGroupCategoryInReleaseSpy;
    beforeEach(() => {
        getGroupCategoryItemsSpy = jest.spyOn(
            Store,
            'getGroupCategoryItems'
        ).mockImplementation(jest.fn());        
        isGroupCategoryInReleaseSpy = jest.spyOn(
            Store,
            'isGroupCategoryInRelease'
        ).mockImplementation(jest.fn());          
    });
    afterEach(() => {
        getGroupCategoryItemsSpy.mockRestore();
        isGroupCategoryInReleaseSpy.mockRestore();
    });   

    test('Test getCategoriesOfGroup(group)', () => { 
        Store.isGroupCategoryInRelease.mockReturnValue(true);
        Store.getGroupCategoryItems.mockReturnValue(groupCategoryItems);
  
        expect(Store.getCategoriesOfGroup("General")).toEqual([
            {category: "Alphabet", kategori: "Abjad"},
            {category: "Number", kategori: "Angka"}
        ]);    
        expect(Store.getCategoriesOfGroup("Daily Life")).toEqual([
            {category: "Occupation", kategori: "Pekerjaan"}        
        ]);        
    });         
});

// Test check if group & groupCategory is in release and get vocab item & detail functions
describe('Test check if group & groupCategory is in release and get vocab item & detail functions', () => {
    let getVocabsItemsSpy;
    beforeEach(() => {
        getVocabsItemsSpy = jest.spyOn(
            Store,
            'getVocabsItems'
        ).mockImplementation(jest.fn());             
    });
    afterEach(() => {
        getVocabsItemsSpy.mockRestore();
    });    

    test('Test isGroupInRelease(groupEng)', () => { 
        Store.getVocabsItems.mockReturnValue(vocabsItems);

        expect(Store.isGroupInRelease("general")).toBeTruthy();
        expect(Store.isGroupInRelease("General")).toBeFalsy();

        expect(Store.isGroupInRelease("people")).toBeTruthy();
        expect(Store.isGroupInRelease("People")).toBeFalsy();

        expect(Store.isGroupInRelease("food")).toBeFalsy();
    });        

    test('Test getVocabDetail(signEng)', () => { 
        Store.getVocabsItems.mockReturnValue(vocabsItems);

        expect(Store.getVocabDetail("One, 1")).toEqual([
            {kumpulanKategori: "Am/Angka", groupCategory: "General/Number", word: "One, 1", perkataan: "1, Satu", video: "https://youtu.be/uxAbFIcd-Js", release: "Release 1", tag: undefined}
        ]);
        expect(Store.getVocabDetail("Three, 3")).toEqual([]);
    }); 
    
    test('Test getVocabItem()', () => { 
        Store.getVocabsItems.mockReturnValue(vocabsItems);

        expect(Store.getVocabItem()).toEqual([
            {kumpulanKategori: "Am/Angka", groupCategory: ["General/Number"], word: "One, 1", perkataan: "1, Satu", video: "https://youtu.be/uxAbFIcd-Js", release: "Release 1", tag: undefined},
            {kumpulanKategori: "Am/Angka", groupCategory: ["General/Number"], word: "Two, 2", perkataan: "2, Dua", video: "https://youtu.be/g8PbfgMqdh0", release: "Release 1", tag: undefined},
            {kumpulanKategori: "Orang/Pekerjaan,Kesihatan/Kecacatan", groupCategory: ["People/Occupation","Health/Disabilities"], word: "Sign language interpreter", perkataan: "Jurubahasa isyarat", video: "https://youtu.be/U3VLfYXqabk", release: "Release 2", tag: undefined}                           
        ]);
    });       
});

// Test get vocab list function
describe('Test get vocab list function', () => {
    let getVocabItemSpy;
    beforeEach(() => {
        getVocabItemSpy = jest.spyOn(
            Store,
            'getVocabItem'
        ).mockImplementation(jest.fn());
    });
    afterEach(() => {
        getVocabItemSpy.mockRestore();
    });    

    test('Test getVocabList(groupEng, categoryEng)', () => { 
        Store.getVocabItem.mockReturnValue(vocabItem);

        expect(Store.getVocabList("people", "occupation")).toEqual([
            {kumpulanKategori: "Orang/Pekerjaan", groupCategory: ["People/Occupation"], word: "Fireman", perkataan: "Ahli bomba", video: "https://youtu.be/qi_tDJdJtCI", release: "Release 1", tag: undefined},
            {kumpulanKategori: "Kesihatan/Kecacatan,Orang/Pekerjaan", groupCategory: ["Health/Disabilities", "People/Occupation"], word: "Sign Language Interpreter", perkataan: "Jurubahasa Isyarat", video: "https://youtu.be/iklx7eWnC_o", release: "Release 1", tag: undefined} 
        ]);

        expect(Store.getVocabList("general", "colours")).toEqual([
            {kumpulanKategori: "Am/Warna", groupCategory: ["General/Colours"], word: "Blue", perkataan: "Biru", video: "https://youtu.be/3YeJeK3BCzA", release: "Release 1", tag: undefined}
        ]);    
    });     
});

// Test get groups functions
describe('Test get groups functions', () => {
    let getGroupsSpy;
    beforeEach(() => {
        getGroupsSpy = jest.spyOn(
            Store,
            'getGroups'
        ).mockImplementation(jest.fn());
    });
    afterEach(() => {
        getGroupsSpy.mockRestore();
    });    

    test('Test getGroupsHome()', () => { 
        Store.getGroups.mockReturnValue(groups);

        expect(Store.getGroupsHome()).toEqual([
            {group: "General", kumpulan: "Am", remark: "Home"},       
            {group: "Daily Life", kumpulan: "Kehidupan", remark: "Home"}
        ]); 
    });
});

// Test format String functions
describe('Test format String functions', () => { 
    test('Test formatString(string)', () => { 
        expect(Store.formatString("General")).toBe("general");
        expect(Store.formatString("Daily Life")).toBe("daily-life");
        expect(Store.formatString("One, 1")).toBe("one,-1");
        expect(Store.formatString("Noodle (I)")).toBe("noodle-(i)");
    });

    test('Test formatGroupCategory(string)', () => { 
        expect(Store.formatGroupCategory("General/Alphabet")).toBe("general/alphabet");
        expect(Store.formatGroupCategory("Daily Life/Occupation")).toBe("daily-life/occupation");
        expect(Store.formatGroupCategory("Culture & Festival/Places & Building")).toBe("culture-&-festival/places-&-building");
    });          
});

// Test get image source functions
describe('Test get image source functions', () => { 
    test('Test getCategoryImgSrc(kategori)', () => { 
        expect(Store.getCategoryImgSrc("Abjad")).toEqual(require("../images/bim/category/Abjad.jpg"));
        
        expect(Store.getCategoryImgSrc("Non Existing Category")).toEqual(require("../images/general/image-coming-soon.jpg"));        
    });

    test('Test getSignImgSrc(kategori)', () => { 
        expect(Store.getSignImgSrc("Ahad")).toEqual(require("../images/bim/vocab/Ahad.jpg"));
        expect(Store.getSignImgSrc("Saudara (I)")).toEqual(require("../images/bim/vocab/Saudara (I).jpg"));  
        expect(Store.getSignImgSrc("14, Empat belas")).toEqual(require("../images/bim/vocab/14, Empat belas.jpg"));  

        expect(Store.getSignImgSrc("Non Existing Category")).toEqual(require("../images/general/image-coming-soon.jpg"));
    });          
});
