import { CLI, Argument } from "@makechtec/tezcatl-cli";
import * as fs from "node:fs";

export class Zalihui{
    run(){
        let targetFile = this.read();
        let matchesAll = this.extractImportMatches(targetFile);
        let matchesNoRepeat = this.removeRepeat(matchesAll);
        let targetFileWithoutImports = this.removeAllImports(targetFile, matchesAll);
        let importsAdded = this.appendImports(targetFileWithoutImports, matchesNoRepeat);
        let withoutExportDefaults = this.removeAllExportDefaults(importsAdded);

        fs.writeFileSync(CLI.getArgumentValue("target").value, withoutExportDefaults);
    }

    removeAllExportDefaults(text: string){
        let regE = new RegExp(EXPORT_DEFAULT_STATEMENT, "g");
        return text.replace(regE, "export ");
    }

    appendImports(text: string, imports: string[]) {
        let firstString = imports.reduce( ( prev: string, current: Argument) => {
            return prev + current.content;
        }, "" );

        return firstString + text;
    }

    removeAllImports(text: string, imports: Array<Argument>) {
        imports.forEach( (imp: Argument) => {
            text = text.replace(imp.content, "");
        } );

        return text;
    }

    removeRepeat(matchesAll: any[]) {
        let matchesNoRepeat = [...matchesAll];
        let temp = [...matchesAll];
        let indexRepeateds = [];

        matchesAll.forEach( (match1: Pointer) => {
            temp.splice(temp.indexOf(match1), 1);
            temp.forEach( (match2: Pointer) => {
                if(match1.content === match2.content) {
                    indexRepeateds.push(matchesAll.indexOf(match2));
                }
            } );
        } );

        indexRepeateds.forEach( (index) => {
            matchesNoRepeat.splice(index, 1);
        } );

        return matchesNoRepeat;
        
    }

    extractImportMatches(targetFile: string) {
        let startRegex = new RegExp(IMPORT_STATEMENT, "g");
        let result: any;
        let matchesAll = [];

        while ((result = startRegex.exec(targetFile)) !== null) {
            let pointer = new Pointer();
            pointer.startIndex = result.index;
            pointer.endIndex = startRegex.lastIndex;
            pointer.content = result[0];

            matchesAll.push(pointer);
        }

        return matchesAll;
    }

    read() {
        let bigFile = "";
        let target = CLI.getArgumentValue("target");
        let sources = CLI.getArgumentsGroup("source");

        sources.forEach((source: Argument) => {
            bigFile += fs.readFileSync(source.value, "utf8") + "\n";
        });

        return bigFile;
    }
}

class Pointer{
    startIndex: number;
    endIndex: number;
    content: string;
}

const IMPORT_STATEMENT = "import\s*(.*)\s*from\s*(.*)\s*;\s*\n";
const EXPORT_DEFAULT_STATEMENT = "export {1,}default ";