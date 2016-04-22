(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['bot.or.th'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    {\n    \"country\": \"th\",\n    \"date\": \""
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.channel : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\",\n    \"currencies\": [\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    ]\n    }\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0["dc:date"] : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    return container.escapeExpression(container.lambda(depth0, depth0));
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "        "
    + ((stack1 = helpers["if"].call(depth0,(data && data.index),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        {\n        \"iso_name\": \""
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0["cb:targetCurrency"] : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\",\n        \"rate\": \""
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0["cb:value"] : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\",\n        \"unit\": \"1\"\n        }\n";
},"6":function(container,depth0,helpers,partials,data) {
    return ",";
},"8":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"_","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers["rdf:RDF"] || (depth0 != null ? depth0["rdf:RDF"] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"rdf:RDF","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers["rdf:RDF"]) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"useData":true});
templates['cbr.ru'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    {\n    \"country\": \"ru\",\n    \"date\": \""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.$ : depth0)) != null ? stack1.Date : stack1), depth0))
    + "\",\n    \"currencies\": [\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.Valute : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    ]\n    }\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "        "
    + ((stack1 = helpers["if"].call(depth0,(data && data.index),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        {\n        \"iso_name\": \""
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.CharCode : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\",\n        \"rate\": \""
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.Value : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\",\n        \"unit\": \""
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.Nominal : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"\n        }\n";
},"3":function(container,depth0,helpers,partials,data) {
    return ",";
},"5":function(container,depth0,helpers,partials,data) {
    return container.escapeExpression(container.lambda(depth0, depth0));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.ValCurs || (depth0 != null ? depth0.ValCurs : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"ValCurs","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.ValCurs) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});
})();