const SKIPPED_FOLDERS = [
    ".git", ".svn", ".hg", "node_modules", "*.cache", ".*cache", ".*_cache", "_site",
    "__pycache__", "venv", ".venv", "env", "*.egg-info", "*.dist-info", "mkdocs_build",
    ".idea", ".vscode", "nbproject", ".settings", "DerivedData", "coverage", "~*",
    "build", "dist", "out", "output", "target", "bin", "obj", "site", "docs/_build",
    ".angular", ".next/cache", ".nuxt", ".parcel-cache", ".pytest_cache", "log",
    ".mypy_cache", ".ruff_cache", ".tox", "temp", "tmp", "logs", "android/app/build",
    "vendor", "deps", "Pods", "bower_components", "jspm_packages", "web_modules",
    ".svelte-kit", "storage", "bootstrap/cache", "public/build", "public/hot",
    "var", ".serverless", ".terraform", "storybook-static", "ios/Pods", "dump"
];

const SKIPPED_FILES = [
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Pipfile.lock", "npm-debug.log*",
    "poetry.lock", "composer.lock", "Gemfile.lock", "Cargo.lock", "Podfile.lock", "go.sum",
    ".DS_Store", "Thumbs.db", ".Rhistory", ".node_repl_history", "yarn-debug.log", ".tfstate",
    ".sublime-workspace", ".sublime-project", ".env", ".tfstate.backup", "yarn-error.log",
    "a.out", "main.exe", "celerybeat-schedule", "npm-debug.log", ".eslintcache"
];

const ALLOWED_FILE_TYPES = [
    ".R", ".ada", ".adb", ".adoc", ".ads", ".asciidoc", ".asm", ".asp", ".aspx", ".ascx",
    ".au3", ".avdl", ".avsc", ".babelrc", ".bash", ".bazel", ".bib", ".browserslistrc", ".c",
    ".cc", ".cfg", ".cg", ".cjs", ".clj", ".cljc", ".cljs", ".cls", ".cmake", ".cmd", ".comp",
    ".conf", ".cpp", ".cs", ".csproj", ".cshtml", ".css", ".dart", ".diff", ".conf", ".ino",
    ".editorconfig", ".edn", ".ejs", ".elm", ".env", ".env.example", ".env.local", ".erl",
    ".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yaml", ".ex", ".exs", ".f",
    ".f90", ".fish", ".for", ".frag", ".fx", ".gd", ".gdshader", ".geom", ".gitattributes",
    ".gitignore", ".gitmodules", ".gitlab-ci.yml", ".glsl", ".gql", ".go", ".graphql",
    ".groovy", ".h", ".haml", ".hbs", ".hh", ".hjson", ".hlsl", ".hpp", ".hrl", ".hs",
    ".htaccess", ".htm", ".html", ".htpasswd", ".inc", ".ini", ".ipynb",
    ".j2", ".java", ".jinja", ".js", ".json", ".json5", ".jsx", ".kt", ".kts", ".less", ".lhs",
    ".liquid", ".lisp", ".log", ".lsp", ".ltx", ".lua", ".m", ".mailmap", ".markdown",
    ".marko", ".md", ".metal", ".mjs", ".mm", ".mustache", ".netlify.toml", ".npmrc",
    ".nvmrc", ".pas", ".patch", ".php", ".pl", ".plist", ".pm", ".pp",
    ".prettierrc", ".prettierrc.js", ".prettierrc.json", ".prettierrc.yaml", ".properties",
    ".proto", ".ps1", ".psd1", ".psm1", ".pug", ".py", ".pyi", ".pylintrc", ".r", ".rb",
    ".rbw", ".rs", ".rst", ".s", ".sass", ".scala", ".scm", ".scss", ".sh",
    ".sln", ".slim", ".soy", ".sql", ".styl", ".sty", ".sv", ".svelte", ".dev",
    ".swift", ".tcl", ".tesc", ".tese", ".tex", ".textile", ".tf", ".tfvars", ".thrift",
    ".toml", ".ts", ".tsx", ".txt", ".twig", ".v", ".vb", ".vbhtml", ".vbproj",
    ".vert", ".vbs", ".vhdl", ".vue", ".vtt", ".wgsl", ".xhtml", ".xml", ".yaml", ".yarnrc",
    ".yml", ".zsh", "BUILD", "CMakeLists.txt", "Cargo.toml", "Dockerfile", "Gemfile",
    "Jenkinsfile", "Makefile", "Pipfile", "Vagrantfile", "WORKSPACE", "bower.json",
    "browserslist", "build.gradle", "build.xml", "composer.json", "docker-compose.yml",
    "now.json", "package.json", "pom.xml", "pyproject.toml", "requirements.txt",
    "rollup.config.js", "setup.py", "tsconfig.json", "vercel.json", "webpack.config.js"
];

const PAYLOAD_SIZE_LIMIT_MB = 5;
const PAYLOAD_SIZE_LIMIT_BYTES = PAYLOAD_SIZE_LIMIT_MB * 1024 * 1024;

function shouldSkip(path) {
    const parts = path.split('/');
    for (const part of parts) {
        if (SKIPPED_FOLDERS.includes(part)) return true;
        if (SKIPPED_FOLDERS.some(pattern => pattern.startsWith('*') && part.endsWith(pattern.substring(1)))) {
            return true;
        }
    }
    const fileName = parts[parts.length - 1];
    if (SKIPPED_FILES.includes(fileName)) return true;
    
    const extension = '.' + fileName.split('.').pop();
    if (fileName.includes('.') && !ALLOWED_FILE_TYPES.includes(extension) && !ALLOWED_FILE_TYPES.includes(fileName)) {
        return true;
    }
    
    return false;
}

function buildFileTree(files) {
    const root = {};
    files.forEach(file => {
        let currentLevel = root;
        const parts = file.webkitRelativePath.split('/');
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                currentLevel[part] = null; 
            } else {
                if (!currentLevel[part + '/']) {
                    currentLevel[part + '/'] = {};
                }
                currentLevel = currentLevel[part + '/'];
            }
        });
    });
    return root;
}

export async function getAllFilesFromDataTransfer(dataTransfer) {
    const files = [];
    const queue = [];

    for (const item of dataTransfer.items) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
            queue.push(entry);
        }
    }

    while (queue.length > 0) {
        const entry = queue.shift();
        if (!entry) continue;

        if (entry.isFile) {
            try {
                const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
                files.push(file);
            } catch (err) {
                console.warn(`Could not read file: ${entry.name}`, err);
            }
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            try {
                const entries = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
                queue.push(...entries);
            } catch (err) {
                console.warn(`Could not read directory: ${entry.name}`, err);
            }
        }
    }
    return files;
}

export async function parseAndFilterProject(fileList) {
    if (!fileList || fileList.length === 0) {
        throw new Error("The selected folder is empty or could not be read.");
    }
    
    const allFiles = Array.from(fileList);
    const includedFiles = [];
    const excludedFiles = [];

    for (const file of allFiles) {
        if (file.webkitRelativePath && !shouldSkip(file.webkitRelativePath)) {
            includedFiles.push(file);
        } else {
            excludedFiles.push({ path: file.webkitRelativePath || file.name });
        }
    }
    
    if (includedFiles.length === 0) {
        throw new Error("No allowed files found in the project after filtering.");
    }

    const fileTree = buildFileTree(includedFiles);

    let totalSize = 0;
    let payload = "";
    const apiFileSeparator = "\n\n---lum--new--file--";

    for (const file of includedFiles) {
        try {
            const content = await file.text();
            const part = `${apiFileSeparator}${file.webkitRelativePath}\n${content}`;
            const partSize = new TextEncoder().encode(part).length;
            
            if (totalSize + partSize > PAYLOAD_SIZE_LIMIT_BYTES) {
                throw new Error(`Project exceeds the ${PAYLOAD_SIZE_LIMIT_MB}MB size limit after filtering.`);
            }
            
            totalSize += partSize;
            payload += part;
        } catch (readError) {
            console.warn(`Skipping file that could not be read: ${file.name}`, readError);
            excludedFiles.push({ path: file.webkitRelativePath || file.name });
        }
    }

    return {
        fileTree,
        includedCount: includedFiles.length,
        excludedCount: excludedFiles.length,
        totalSize,
        payload: payload.trim(),
    };
}