const app_environment = {
    "MiTalentTestApi": "https://test-webapi.mitalent.org/pathfinder/api/Schools?$inlinecount=allpages&$filter=substringof('__SearchVariable__', InstName1)%20eq%20true",
    "SAA_Facility": "https://dev-webapi.wda.state.mi.us/SAA_API/facility/0?nameContain=__SearchVariable__",
    "SAA_Facility_Id": "https://dev-webapi.wda.state.mi.us/SAA_API/facility/__SearchVariable__",
    "SAA_Facility_Programs":  "https://dev-webapi.wda.state.mi.us/SAA_API/program/0?facilityid=__SearchVariable__",
    "SAA_Program": "https://dev-webapi.wda.state.mi.us/SAA_API/program/0?titleContain=__SearchVariable__",
    "SAA_Program_Unique": "https://dev-webapi.wda.state.mi.us/SAA_API/program/unique/__SearchVariable__",
    "SAA_Program_Facilities": "https://dev-webapi.wda.state.mi.us/SAA_API/program/0?titleequal=__SearchVariable__",
    "SAA_Keyword": ""
}



// Facility:
// Base: https://dev-webapi.wda.state.mi.us/SAA_API/api/facility
// Get 1 facility by id: https://dev-webapi.wda.state.mi.us/SAA_API/facility/<id> 
//                   Ex. https://dev-webapi.wda.state.mi.us/SAA_API/facility/462
// Get facilities that begin with: https://dev-webapi.wda.state.mi.us/SAA_API/facility/0?nameBegin=<start of name>
//                             Ex. https://dev-webapi.wda.state.mi.us/SAA_API/facility/0?nameBegin=Lans
// Get facilities that contain: https://dev-webapi.wda.state.mi.us/SAA_API/facility/0?nameContain=<string>
//                          Ex. https://dev-webapi.wda.state.mi.us/SAA_API/facility/0?nameContain=plumb
// Get Facilities in a city: https://dev-webapi.wda.state.mi.us/SAA_API/facility/0?city=grand%20rapids
// Get facilities for an area of study: https://dev-webapi.wda.state.mi.us/SAA_API/facility/0?areaofstudy=massage


// Programs:
// All programs: https://dev-webapi.wda.state.mi.us/SAA_API/program
// One program by id: https://dev-webapi.wda.state.mi.us/SAA_API/program/27
// Programs in a facility: https://dev-webapi.wda.state.mi.us/SAA_API/program/0?facilityid=462
// Programs that begin with: https://dev-webapi.wda.state.mi.us/SAA_API/program/0?titleBegin=medical
// Programs that contain: https://dev-webapi.wda.state.mi.us/SAA_API/program/0?titleContain=electric
// Programs in an area of study: https://dev-webapi.wda.state.mi.us/SAA_API/program/0?areaofstudy=electric


// Keywords:
// https://dev-webapi.wda.state.mi.us/SAA_API/searchkey/%22grand%20rapids%22
// Note that the keyword can be things like (use double quote when you have space) “grand near rapids”
// https://docs.microsoft.com/en-us/sql/t-sql/queries/contains-transact-sql?view=sql-server-2017


// Type: 1 = facility, 2 = program


// For Unique programs and facility count
    // https://dev-webapi.wda.state.mi.us/SAA_API/program/unique/all

// To get all facilities for a program. Use title from above endpoint and use
    // https://dev-webapi.wda.state.mi.us/SAA_API/program/0?titleequal=Electrician

// You can filter for unique programs (Ex. To display all programs with “elec” in the title)
    // https://dev-webapi.wda.state.mi.us/SAA_API/program/unique/elec
