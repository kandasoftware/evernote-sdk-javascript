test("a basic test example", function() {
  ok( true, "this test is fine" );
  var value = "hello";
  equal( value, "hello", "We expect value to be hello" );
});
test('get_user()', function(){
    get_user();
});
test('get_list_notebooks()', function(){
    get_list_notebooks();
});
test('create_note()', function(){
    create_note();
});


