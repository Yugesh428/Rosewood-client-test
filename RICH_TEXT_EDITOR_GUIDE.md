# Rich Text Editor for Blog Posts

## Overview
The blog creation form now includes a **WYSIWYG (What You See Is What You Get)** rich text editor powered by Tiptap. This allows clients to write blog content without knowing HTML.

## Features

### Text Formatting
- **Bold** (Ctrl/Cmd + B)
- **Italic** (Ctrl/Cmd + I)
- **Underline** (Ctrl/Cmd + U)

### Headings
- Heading 1 (H1) - Large heading
- Heading 2 (H2) - Medium heading
- Heading 3 (H3) - Small heading

### Lists
- **Bullet List** - Unordered list with bullet points
- **Numbered List** - Ordered list with numbers

### Alignment
- Align Left
- Align Center
- Align Right

### Additional Features
- **Quote Block** - For highlighting quotes
- **Code Block** - For displaying code snippets
- **Add Link** - Click to add a hyperlink (prompts for URL)
- **Add Image** - Click to add an image (prompts for image URL)
- **Undo/Redo** - Undo or redo recent changes

## How to Use

### For Content Writers
1. Click "New Blog Post" button
2. Fill in the title, category, and other metadata
3. In the **Content** section, use the toolbar buttons to format your text:
   - Type normally and select text to apply formatting
   - Click heading buttons to make headings
   - Click list buttons to create lists
   - Click link button to add hyperlinks
   - Click image button to add images from URLs

### Adding Images
When you click the **Image** button:
1. A prompt will ask for an image URL
2. You can use:
   - Unsplash URLs (https://unsplash.com)
   - Google Drive shared image links
   - Any publicly accessible image URL
3. The image will be embedded in your content

### Adding Links
When you click the **Link** button:
1. Select the text you want to make clickable
2. Click the Link button
3. Enter the URL in the prompt
4. The text becomes a clickable link

## Technical Details

### Components
- **RichTextEditor.tsx** - The main rich text editor component
- **BlogsClient.tsx** - Updated to use the rich text editor

### Libraries Used
- `@tiptap/react` - Core Tiptap editor
- `@tiptap/starter-kit` - Basic formatting features
- `@tiptap/extension-underline` - Underline support
- `@tiptap/extension-text-align` - Text alignment
- `@tiptap/extension-link` - Hyperlink support
- `@tiptap/extension-image` - Image embedding

### Output Format
The editor generates clean HTML that is automatically saved when you create or update a blog post. The HTML includes proper semantic tags like:
- `<h1>`, `<h2>`, `<h3>` for headings
- `<p>` for paragraphs
- `<ul>`, `<ol>`, `<li>` for lists
- `<blockquote>` for quotes
- `<a>` for links
- `<img>` for images

## Benefits
1. **No HTML Knowledge Required** - Writers can focus on content, not code
2. **Consistent Formatting** - Ensures all blog posts use proper HTML structure
3. **Visual Editing** - See exactly how content will look while editing
4. **Error Prevention** - Reduces HTML syntax errors
5. **Faster Content Creation** - More intuitive than writing raw HTML

## Keyboard Shortcuts
- **Bold**: Ctrl/Cmd + B
- **Italic**: Ctrl/Cmd + I
- **Underline**: Ctrl/Cmd + U
- **Undo**: Ctrl/Cmd + Z
- **Redo**: Ctrl/Cmd + Shift + Z

## Tips for Writers
1. Use headings to structure your content hierarchically
2. Break up long paragraphs for better readability
3. Use lists for step-by-step instructions or bullet points
4. Add images to make content more engaging
5. Use blockquotes to highlight important quotes or callouts
6. Preview your blog post before publishing

## Troubleshooting

### Editor Not Loading
- Refresh the page
- Check browser console for errors
- Make sure JavaScript is enabled

### Images Not Showing
- Verify the image URL is publicly accessible
- Make sure the URL ends with a valid image extension (.jpg, .png, etc.)
- Try using a different image hosting service

### Formatting Issues
- Use the Undo button to revert unwanted changes
- Clear all formatting by selecting text and reapplying desired format
- Copy-paste from external sources may bring unwanted formatting - type directly when possible
