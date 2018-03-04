
/**
 * This file contains a Jscodeshift Util plugin that adds some helper methods to the jscodeshift
 * collection object.
 */
export default j => {
  const findFirst = function (type) {
    const found = this.find(type);

    return found.at(0);
  };

  const findLast = function(type) {
    const found = this.find(type);

    return found.at(found.length - 1);
  };

  // Add an import to the end of the last import declaration
  // Note: Must have an existing import declaration in the file for this to work
  const addImport = function(node) {
    const specifiers = node.specifiers;
    const source = node.source;
    const existingSource = this.find(j.ImportDeclaration, (node) => node.source.value === source.value);

    if (existingSource.size() > 0) {
      const existingNode = existingSource.get();
      const missingSpecifiers = specifiers.filter(importSpecifier =>
        existingSource.find(j.ImportSpecifier, (existingSpecifier) =>
          existingSpecifier.local.name === importSpecifier.local.name
        ).size() === 0
      );
      existingNode.node.specifiers = existingNode.node.specifiers.concat(missingSpecifiers);

    } else {
      this.findLast(j.ImportDeclaration)
        .insertAfter(node);
    }
    
    return this;
  }

  const addTest = function(testNode) {
    const block = this.findFirst(j.ArrowFunctionExpression)
      .findFirst(j.BlockStatement);
    
    if (block.size() > 0) {
      block.get().node.body.push(testNode);
    }
    
    return this;
  }

  const addToProgram = function(node, idempCondition) {
    if (idempCondition(this)) {
      const program = this.find(j.Program);
      if (program.size() === 0) {
        console.error('Could not find program node');
      }

      program.get().node.body.push(node);
    }
    
    return this;
  }

  // jscodeshift.template.statement is buggy when using nested template literals
  // so lets make our own here
  // Can be used like so: <Jscodeshift Collection>.code('my code here')
  // Calling jscodeshift on an empty string is one way to get a jscodeshift
  // collection if you don't already have one, e.g. j(''). Unfortunately it is
  // not exposed via the jscodeshift API directly.
  const code = function(codeString) {
    return j(codeString).find(j.Program).get().node.body[0];
  }

  j.registerMethods({
    findFirst,
    findLast,
    addImport,
    addTest,
    addToProgram,
    code,
  });
};
