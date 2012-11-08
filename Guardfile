guard 'coffeescript', :input => 'src', :output => 'dist'
guard 'coffeescript', :input => 'src', :output => 'example/static/js/bags'
guard 'coffeescript', :input => 'spec/coffeescripts', :output => 'spec/javascripts'
guard 'rocco', :run_on => [:start, :change], :dir => 'docs', :stylesheet => 'http://jashkenas.github.com/docco/resources/docco.css' do
  watch(%r{^src/.*\.coffee$})
end
