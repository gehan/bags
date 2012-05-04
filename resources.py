PIPELINE_JS = {
    'base_libs': {
        'source_filenames': (
            "js/lib/mootools-core-1.4.5.js",
            "js/lib/mootools-more-1.4.0.1.js",
            "js/lib/mootools.history.js",
            "js/lib/behaviour/Element.Data.js",
            "js/lib/behaviour/Event.Mock.js",
            "js/lib/behaviour/BehaviorAPI.js",
            "js/lib/behaviour/Behavior.js",
            "js/lib/behaviour/Delegator.js",
            "js/lib/behaviour/Behavior.Startup.js",
            "js/lib/dust-full-0.3.0.min.js",
        ),
        'output_filename': 'js/base_libs.js',
    },
    'init': {
        'source_filenames': (
            "js/core/Model.js",
            "js/core/Collection.js",
            "js/core/Templates.js",
            "js/core/View.js",
            "js/core/utils/behavior.js",
        ),
        'output_filename': 'js/init.js',
    }
}

PIPELINE_CSS = {
    'base': {
        'source_filenames': (
            "css/normalize.css",
        ),
        'output_filename': 'css/base.css',
    }
}

