import { Keys } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.keyboard.HomeEndKeysTest', () => {
  const platform = PlatformDetection.detect();
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  const keystroke = (key: number) => (editor: Editor, ctrlKey: boolean, shiftKey: boolean) => TinyContentActions.keystroke(editor, key, { ctrlKey, shiftKey });

  context('Home key', () => {
    const homeKey = keystroke(Keys.home());

    it('Home key should move caret before cef within the same block', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span>456</p>');
      TinySelections.setCursor(editor, [ 1, 1 ], 3);
      homeKey(editor, false, false);
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    it('Home key should move caret from after cef to before cef', () => {
      const editor = hook.editor();
      editor.setContent('<p><span contenteditable="false">CEF</span></p>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      homeKey(editor, false, false);
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('Home key should move caret to before cef from the start of range', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span>456<br>789</p>');
      TinySelections.setSelection(editor, [ 1, 1 ], 3, [ 1, 1 ], 3);
      homeKey(editor, false, false);
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    it('Home key should not move caret before cef within the same block if there is a BR in between', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span><br>456</p>');
      TinySelections.setCursor(editor, [ 1, 2 ], 3);
      homeKey(editor, false, false);
      TinyAssertions.assertCursor(editor, [ 1, 2 ], 3);
    });

    it('Home key should not move caret if there is no cef', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      homeKey(editor, false, false);
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    // Only test Shift+Home for OSX as that is the shortcut for selecting to the start of the document
    context('Shift (OSX)', () => {
      before(function () {
        if (!platform.os.isOSX()) {
          this.skip();
        }
      });

      it('TINY-7460: make selection to start of the cef block', () => {
        const editor = hook.editor();
        editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');
        TinySelections.setCursor(editor, [ 2, 0 ], 2);
        homeKey(editor, false, true);
        TinyAssertions.assertSelection(editor, [], 0, [ 1, 0 ], 2);
      });
    });

    context('Ctrl+Shift', () => {
      before(function () {
        // Skip OSX as it has differnt shortcut for selecting to the start/end of the document
        if (platform.os.isOSX()) {
          this.skip();
        }
      });

      it('TINY-7460: make selection to start of the cef block', () => {
        const editor = hook.editor();
        editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');
        TinySelections.setCursor(editor, [ 2, 0 ], 2);
        homeKey(editor, true, true);
        TinyAssertions.assertSelection(editor, [], 0, [ 1, 0 ], 2);
      });
    });

    context('Inline boundaries', () => {
      it('TINY-4612: move caret out and at the beginning of the element', () => {
        const editor = hook.editor();
        editor.setContent('<p><a href="google.com">link</a>test</p>');
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
        homeKey(editor, false, false);
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      });

      it('TINY-4612: move caret at the beginning of the line (parent) if the first element is an inline element', () => {
        const editor = hook.editor();
        editor.setContent('<p><a href="google.com">link1</a>test</p>');
        TinySelections.setCursor(editor, [ 0, 1 ], 3);
        homeKey(editor, false, false);
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      });
    });
  });

  context('End key', () => {
    const endKey = keystroke(Keys.end());

    it('End key should move caret after cef within the same block', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<span contenteditable="false">CEF</span></p><p>456</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      endKey(editor, false, false);
      TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
    });

    it('End key should move caret from before cef to after cef', () => {
      const editor = hook.editor();
      editor.setContent('<p><span contenteditable="false">CEF</span></p>');
      TinySelections.setCursor(editor, [ 0 ], 0);
      endKey(editor, false, false);
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
    });

    it('End key should move caret to after cef from the end of range', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<br>456<span contenteditable="false">CEF</span></p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 0);
      endKey(editor, false, false);
      TinyAssertions.assertSelection(editor, [ 0, 4 ], 1, [ 0, 4 ], 1);
    });

    it('End key should not move caret after cef within the same block if there is a BR in between', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<br><span contenteditable="false">CEF</span></p><p>456</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      endKey(editor, false, false);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    });

    it('End key should not move caret if there is no cef', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      endKey(editor, false, false);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    // Only test Shift+End for OSX as that is the shortcut for selecting to the end of the document
    context('Shift (OSX)', () => {
      before(function () {
        if (!platform.os.isOSX()) {
          this.skip();
        }
      });

      it('TINY-7460: make selection to end of the cef block', () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        endKey(editor, false, true);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [], 2);
      });
    });

    context('Ctrl+Shift', () => {
      before(function () {
        // Skip OSX as it has differnt shortcut for selecting to the start/end of the document
        if (platform.os.isOSX()) {
          this.skip();
        }
      });

      it('TINY-7460: make selection to end of the cef block', () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        endKey(editor, true, true);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [], 2);
      });
    });

    context('Inline boundaries', () => {
      it('TINY-4612: move caret out and at end of the element', () => {
        const editor = hook.editor();
        editor.setContent('<p>test<a href="google.com">link</a></p>');
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
        endKey(editor, false, false);
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
      });

      it('TINY-4612: move caret at the end of the line (parent) if the last element is an inline element', () => {
        const editor = hook.editor();
        editor.setContent('<p>test<a href="google.com">link 2</a></p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        endKey(editor, false, false);
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
      });
    });
  });
});
