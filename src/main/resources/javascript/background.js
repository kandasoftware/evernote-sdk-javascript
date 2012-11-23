/**
 * Simple examples of code usage
 * Example creates a Google Chrome Extension that uses OAuth to access an API
 */
////////////////////////////////////////

function get_list_notebooks() {
    var noteStore = get_NoteStore();
    if (noteStore) {
        //response is result array of notebooks
        //callback function process response
        var response = noteStore.listNotebooks(Eventnote.Auth.get_auth_token());
	console.log(response);
    }
}

function create_note(){
    var noteStore = get_NoteStore();
    var note = new Note();
    note.title = "test note";
    //important to set correct content
    var content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        + "<!DOCTYPE en-note SYSTEM \"http://xml.evernote.com/pub/enml2.dtd\"><en-note>";
    content += String("some description").replace(/\n/g, "<br/>") + "<br/>";
    content += "</en-note>";
    note.content = content;
    //response is a created note
    //callback function process response
    var response = noteStore.createNote(Eventnote.Auth.get_auth_token(),note);
    console.log("note was created");
    console.log(response);
}

function get_user(){
    Eventnote.Auth.authenticate(function(){
        console.log("log in");
    });
    var userStore = get_userStore();
    if(userStore){
        //response is an active user
        //callback function process response
        var response = userStore.getUser(Eventnote.Auth.get_auth_token());
	console.log(response);
    }
}

function get_NoteStore() {
    var notesTransport = new Thrift.Transport(Eventnote.Auth.oauth.getParameter(Eventnote.Auth.note_store_url_param));
    var notesProtocol = new Thrift.Protocol(notesTransport);
    var noteStore = new NoteStoreClient(notesProtocol, notesProtocol);
    if (!noteStore) {
        console.log("connection failure during getting note store");
    }
    return noteStore;
}

function get_userStore() {
    var userStoreUrl = Eventnote.Auth.oauth.getParameter(Eventnote.Auth.api_url_prefix).match(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/)[0];
    var usersTransport = new Thrift.Transport(userStoreUrl + "/edam/user");
    var usersProtocol = new Thrift.Protocol(usersTransport);
    return new UserStoreClient(usersProtocol, usersProtocol);
};

