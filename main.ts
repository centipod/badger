import { mkdir } from 'node:fs/promises';

(async () => {

    // Imports
    const core = require("@actions/core");
    const exec = require("@actions/exec");
    const fs = require('fs');

    try {

        // Inputs
        const branch = core.getInput("branch", { required: false });
        const directory = core.getInput("directory", { required: false });
        const label = core.getInput("label", { required: true });
        const value = core.getInput("value", { required: true });
        const status = core.getBooleanInput("status", { required: true });

        core.debug("Input", "branch: " + branch);
        core.debug("Input", "directory: " + directory);
        core.debug("Input", "label: " + label);
        core.debug("Input", "value: " + value);
        core.debug("Input", "status: " + (status ? 'green' : 'red'));

        // Get color sections
        const time = Date.now();
        const green = '<linearGradient id="state-fill" x1="50%" y1="0%" x2="50%" y2="100%"><stop stop-color="#34D058" offset="0%"/><stop stop-color="#28A745" offset="100%"/></linearGradient>';
        const red = '<linearGradient xmlns="http://www.w3.org/2000/svg" id="state-fill" x1="50%" y1="0%" x2="50%" y2="100%"><stop stop-color="#D73A49" offset="0%"/><stop stop-color="#CB2431" offset="100%"/></linearGradient>';
        const svg = '<!-- @TIME@ --><svg xmlns="http://www.w3.org/2000/svg" width="154" height="20"> <title>@NAME@ - @VALUE@</title> <defs> <linearGradient id="workflow-fill" x1="50%" y1="0%" x2="50%" y2="100%"> <stop stop-color="#444D56" offset="0%"/> <stop stop-color="#24292E" offset="100%"/> </linearGradient> @COLOR@ </defs> <g fill="none" fill-rule="evenodd"> <g font-family="\'DejaVu Sans\',Verdana,Geneva,sans-serif" font-size="11"> <path id="workflow-bg" d="M0,3 C0,1.3431 1.3552,0 3.02702703,0 L104,0 L104,20 L3.02702703,20 C1.3552,20 0,18.6569 0,17 L0,3 Z" fill="url(#workflow-fill)" fill-rule="nonzero"/> <text fill="#010101" fill-opacity=".3"> <tspan x="22.1981982" y="15" aria-hidden="true">@NAME@</tspan> </text> <text fill="#FFFFFF"> <tspan x="22.1981982" y="14">@NAME@</tspan> </text> </g> <g transform="translate(104)" font-family="\'DejaVu Sans\',Verdana,Geneva,sans-serif" font-size="11"> <path d="M0 0h46.939C48.629 0 50 1.343 50 3v14c0 1.657-1.37 3-3.061 3H0V0z" id="state-bg" fill="url(#state-fill)" fill-rule="nonzero"/> <text fill="#010101" fill-opacity=".3" aria-hidden="true"> <tspan x="4" y="15">@VALUE@</tspan> </text> <text fill="#FFFFFF"> <tspan x="4" y="14">@VALUE@</tspan> </text> </g> <path fill="#959DA5" d="M11 3c-3.868 0-7 3.132-7 7a6.996 6.996 0 0 0 4.786 6.641c.35.062.482-.148.482-.332 0-.166-.01-.718-.01-1.304-1.758.324-2.213-.429-2.353-.822-.079-.202-.42-.823-.717-.99-.245-.13-.595-.454-.01-.463.552-.009.946.508 1.077.718.63 1.058 1.636.76 2.039.577.061-.455.245-.761.446-.936-1.557-.175-3.185-.779-3.185-3.456 0-.762.271-1.392.718-1.882-.07-.175-.315-.892.07-1.855 0 0 .586-.183 1.925.718a6.5 6.5 0 0 1 1.75-.236 6.5 6.5 0 0 1 1.75.236c1.338-.91 1.925-.718 1.925-.718.385.963.14 1.68.07 1.855.446.49.717 1.112.717 1.882 0 2.686-1.636 3.28-3.194 3.456.254.219.473.639.473 1.295 0 .936-.009 1.689-.009 1.925 0 .184.131.402.481.332A7.011 7.011 0 0 0 18 10c0-3.867-3.133-7-7-7z"/> </g> </svg>';

        // Update SVG code
        const content = svg
                .replace('@COLOR@', status ? green : red)
                .replace(/@NAME@/g, label)
                .replace(/@VALUE@/g, value)
                .replace('@TIME@', '' + time);

        // Write to file
        await mkdir(directory, { recursive: true });
        const name = label.replace(/[^A-Za-z0-9]+/g, '').toLowerCase();
        const path = directory + '/' + name + '.svg';
        core.debug("Creating badge with timestamp " + time, path);
        fs.writeFileSync(path, content);

        if (branch) {

            // Add and commit badge
            core.info("Committing to " + branch + "..")
            await exec.exec("git config user.email \"badger@centipod.io\"");
            await exec.exec("git config user.name \"badger\"");
            await exec.exec("git add " + path);
            await exec.exec("git commit -m \"Updated badge\"");
            await exec.exec("git push origin HEAD:" + branch);
        }

        // Return path to badge
        core.info("To use your badge: ![](" + path + ")")
        core.setOutput('location', path);
    } catch (err) {

        core.setFailed(`Failed: ${err}`);
    }
})();
